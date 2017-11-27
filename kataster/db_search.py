from db import db_query
from utils import search_string, hash_timestamp


def construct_SQL_filter_data(person, search_params):
    def format_datum(param, person):
        if param == 'firstname' or param == 'surname':
            return search_string(person[param])
        return person[param]
    SQL_filter_data = tuple(format_datum(param, person) for param in search_params)
    return SQL_filter_data

def construct_SQL_filter(person, search_params):
    """ Construct an SQL filtering expression from the search_params
        fields of the person dictionary (JSON). Returns the SQL expression
        with placeholders, and values to feed for those placeholders. """
    SQL_filters = {
        'firstname': """kataster.Subjects.FirstNameSearch=%s""",
        'surname': """kataster.Subjects.SurnameSearch=%s""",
        'dobhash': """kataster.Subjects.DobHash=%s""",
    }
    SQL_filter = ' AND '.join([SQL_filters[param] for param in search_params])
    SQL_filter_data = construct_SQL_filter_data(person, search_params)
    return SQL_filter, SQL_filter_data

def get_Parcels_from_database(db, person, search_params):
    SQL_filter, SQL_filter_data = construct_SQL_filter(person, search_params)
    q = """
        WITH
        Parcels AS (
            SELECT FolioId, No, Area, Id, LandUseId, UtilisationId, CadastralUnitId, ValidTo, 'C' AS ParcelType FROM kataster.ParcelsC
            UNION
            SELECT FolioId, No, Area, Id, LandUseId, UtilisationId, CadastralUnitId, ValidTo, 'E' AS ParcelType FROM kataster.ParcelsE
        ),
        OwnershipRecordsWithLegalRightTexts AS (
            SELECT
                kataster.OwnershipRecords.Id AS Id,
                kataster.OwnershipRecords.FolioId AS FolioId,
                array_remove(array_agg(kataster.LegalRights.TextEscaped), NULL) AS LegalRightTexts
            FROM
                kataster.OwnershipRecords
            LEFT JOIN
                kataster.OwnershipRecordLegalRights ON kataster.OwnershipRecordLegalRights.OwnershipRecordId = kataster.OwnershipRecords.Id
            LEFT JOIN
                kataster.LegalRights ON kataster.LegalRights.Id = kataster.OwnershipRecordLegalRights.LegalRightId
            GROUP BY
                kataster.OwnershipRecords.Id
        )
        SELECT DISTINCT ON (CadastralUnitCode, FolioNo, ParcelNo, ParticipantTypeName)
            Parcels.ParcelType AS ParcelType,
            Parcels.No AS ParcelNo,
            Parcels.Area AS Area,
            kataster.Folios.No AS FolioNo,
            kataster.Folios.OwnersCount AS FolioOwnersCount,
            OwnershipRecordsWithLegalRightTexts.LegalRightTexts AS LegalRightTexts,
            kataster.LandUses.Name AS LandUseName,
            kataster.Utilisations.Name AS UtilisationName,
            kataster.ParticipantTypes.Name AS ParticipantTypeName,
            kataster.CadastralUnits.Code AS CadastralUnitCode,
            kataster.CadastralUnits.Name AS CadastralUnitName,
            100.0 * kataster.Participants.Numerator / kataster.Participants.Denominator AS ParticipantRatio,
            kataster.Subjects.FirstName AS FirstName,
            kataster.Subjects.Surname AS Surname
        FROM
            Parcels
        INNER JOIN
            kataster.Folios ON kataster.Folios.Id = Parcels.FolioId
        INNER JOIN
            OwnershipRecordsWithLegalRightTexts ON OwnershipRecordsWithLegalRightTexts.FolioId = kataster.Folios.Id
        INNER JOIN
            kataster.Participants ON kataster.Participants.OwnershipRecordId = OwnershipRecordsWithLegalRightTexts.Id
        INNER JOIN
            kataster.SubjectParticipant ON kataster.SubjectParticipant.ParticipantId = kataster.Participants.Id
        INNER JOIN
            kataster.Subjects ON kataster.Subjects.Id = kataster.SubjectParticipant.SubjectId
        INNER JOIN
            kataster.LandUses ON kataster.LandUses.Id = Parcels.LandUseId
        INNER JOIN
            kataster.Utilisations ON kataster.Utilisations.Id = Parcels.UtilisationId
        INNER JOIN
            kataster.ParticipantTypes ON kataster.ParticipantTypes.Id = kataster.Participants.TypeId
        INNER JOIN
            kataster.CadastralUnits ON kataster.CadastralUnits.Id = Parcels.CadastralUnitId
        WHERE
            """ + SQL_filter + """
        ORDER BY
            CadastralUnitCode, FolioNo, ParcelNo, ParticipantTypeName, Parcels.ValidTo DESC
        ;"""
    rows = db_query(db, q, SQL_filter_data)

    # Convert ParticipantRatio to floats for JSON serialisability
    for row in rows:
        if row['participantratio'] is not None:
            row['participantratio'] = float(row['participantratio'])

    return rows

def count_Parcels_in_database(db):
    q = """
        WITH
        Parcels AS (
            SELECT FolioId, No, Area, Id, LandUseId, UtilisationId, CadastralUnitId, ValidTo, 'C' AS ParcelType FROM kataster.ParcelsC
            UNION
            SELECT FolioId, No, Area, Id, LandUseId, UtilisationId, CadastralUnitId, ValidTo, 'E' AS ParcelType FROM kataster.ParcelsE
        ),
        ParcelsOwned AS (
            SELECT DISTINCT ON (CadastralUnitCode, FolioNo, ParcelNo)
                Parcels.No AS ParcelNo,
                kataster.Folios.No AS FolioNo,
                kataster.LandUses.Name AS LandUseName,
                kataster.CadastralUnits.Code AS CadastralUnitCode,
                kataster.Subjects.FirstNameSearch AS FirstNameSearch,
                kataster.Subjects.SurnameSearch AS SurnameSearch,
                kataster.Subjects.DobHash AS DobHash
            FROM
                Parcels
            INNER JOIN
                kataster.Folios ON kataster.Folios.Id = Parcels.FolioId
            INNER JOIN
                kataster.OwnershipRecords ON kataster.OwnershipRecords.FolioId = kataster.Folios.Id
            INNER JOIN
                kataster.Participants ON kataster.Participants.OwnershipRecordId = kataster.OwnershipRecords.Id
            INNER JOIN
                kataster.SubjectParticipant ON kataster.SubjectParticipant.ParticipantId = kataster.Participants.Id
            INNER JOIN
                kataster.Subjects ON kataster.Subjects.Id = kataster.SubjectParticipant.SubjectId
            INNER JOIN
                kataster.LandUses ON kataster.LandUses.Id = Parcels.LandUseId
            INNER JOIN
                kataster.CadastralUnits ON kataster.CadastralUnits.Id = Parcels.CadastralUnitId
            WHERE
                kataster.Participants.TypeId=1
            ORDER BY
                CadastralUnitCode, FolioNo, ParcelNo, Parcels.ValidTo DESC
        )
        SELECT
            FirstNameSearch, SurnameSearch, DobHash, LandUseName, COUNT(*) AS GroupCount
        FROM
            ParcelsOwned
        GROUP BY
            FirstNameSearch, SurnameSearch, DobHash, LandUseName
        ;"""
    rows = db_query(db, q)
    return rows
