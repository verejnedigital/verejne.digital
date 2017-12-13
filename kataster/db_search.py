#!/usr/bin/env python
# -*- coding: utf-8 -*-
from db import db_query
from utils import search_string, hash_timestamp, Mercator_to_WGS84


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
            SELECT FolioId, No, Area, minX, maxX, minY, maxY, Id, LandUseId, UtilisationId, CadastralUnitId, ValidTo, 'C' AS ParcelType FROM kataster.ParcelsC
            UNION
            SELECT FolioId, No, Area, minX, maxX, minY, maxY, Id, LandUseId, UtilisationId, CadastralUnitId, ValidTo, 'E' AS ParcelType FROM kataster.ParcelsE
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
        ),
        ParcelsFiltered AS (
            SELECT
                Parcels.ParcelType AS ParcelType,
                Parcels.No AS ParcelNo,
                Parcels.Area AS Area,
                0.5 * (Parcels.minX + Parcels.maxX) AS MercatorX,
                0.5 * (Parcels.minY + Parcels.maxY) AS MercatorY,
                kataster.Folios.No AS FolioNo,
                kataster.Folios.OwnersCount AS FolioOwnersCount,
                OwnershipRecordsWithLegalRightTexts.LegalRightTexts AS LegalRightTexts,
                kataster.LandUses.Name AS LandUseName,
                kataster.Utilisations.Name AS UtilisationName,
                kataster.CadastralUnits.Code AS CadastralUnitCode,
                kataster.CadastralUnits.Name AS CadastralUnitName,
                100.0 * kataster.Participants.Numerator / kataster.Participants.Denominator AS ParticipantRatio,
                kataster.Subjects.FirstName AS FirstName,
                kataster.Subjects.Surname AS Surname,
                Parcels.ValidTo AS ValidTo
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
                kataster.CadastralUnits ON kataster.CadastralUnits.Id = Parcels.CadastralUnitId
            WHERE
                kataster.Participants.TypeId=1 AND
                """ + SQL_filter + """
        )
        SELECT DISTINCT ON (CadastralUnitCode, FolioNo, ParcelNo)
            *
        FROM
            ParcelsFiltered
        ORDER BY
            CadastralUnitCode, FolioNo, ParcelNo, ValidTo DESC
        ;"""
    rows = db_query(db, q, SQL_filter_data)

    # Convert the coordinates to WGS84
    for row in rows:
        row['lat'], row['lon'] = Mercator_to_WGS84(row['mercatorx'], row['mercatory'])
        del row['mercatorx']
        del row['mercatory']

    # Ensure JSON serialisability: convert ParticipantRatio to float
    for row in rows:
        del row['validto']
        if row['participantratio'] is not None:
            row['participantratio'] = float(row['participantratio'])

    return rows

def get_politicians_with_Folio_counts(db):
    q = """
        WITH
        ParcelsAll AS (
            SELECT FolioId, No, Area, Id, LandUseId, UtilisationId, CadastralUnitId, ValidTo, 'C' AS ParcelType FROM kataster.ParcelsC
            UNION ALL
            SELECT FolioId, No, Area, Id, LandUseId, UtilisationId, CadastralUnitId, ValidTo, 'E' AS ParcelType FROM kataster.ParcelsE
        ),
        Parcels AS (
            SELECT DISTINCT ON (CadastralUnitCode, FolioNo, No)
                ParcelsAll.*,
                kataster.CadastralUnits.Code AS CadastralUnitCode,
                kataster.Folios.No AS FolioNo
            FROM
                ParcelsAll
            INNER JOIN
                kataster.Folios ON kataster.Folios.Id = ParcelsAll.FolioId
            INNER JOIN
                kataster.CadastralUnits ON kataster.CadastralUnits.Id = ParcelsAll.CadastralUnitId
            ORDER BY
                CadastralUnitCode, FolioNo, No, ValidTo DESC
        ),
        ParcelsOwned AS (
            SELECT DISTINCT
                kataster.Folios.No AS FolioNo,
                kataster.LandUses.Name AS LandUseName,
                kataster.CadastralUnits.Code AS CadastralUnitCode,
                kataster.Subjects.FirstNameSearch AS SubjectFirstNameSearch,
                kataster.Subjects.SurnameSearch AS SubjectSurnameSearch,
                kataster.Subjects.DobHash AS SubjectDobHash
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
        ),
        PoliticianCounts AS (
            SELECT
                kataster.politicians.Id AS Id,
                kataster.politicians.FirstName AS FirstName,
                kataster.politicians.Surname AS Surname,
                kataster.politicians.Title AS Title,
                COUNT(*) FILTER (WHERE LandUseName = 'Zastavaná plocha a nádvorie') AS num_houses_flats,
                COUNT(*) FILTER (WHERE LandUseName = 'Orná pôda' OR LandUseName = 'Záhrada') AS num_fields_gardens,
                COUNT(*) FILTER (WHERE LandUseName != 'Zastavaná plocha a nádvorie' AND LandUseName != 'Orná pôda' AND LandUseName != 'Záhrada') AS num_others
            FROM
                kataster.politicians
            LEFT OUTER JOIN
                ParcelsOwned ON
                    ParcelsOwned.SubjectFirstNameSearch = kataster.politicians.FirstNameSearch AND
                    ParcelsOwned.SubjectSurnameSearch = kataster.politicians.SurnameSearch AND
                    ParcelsOwned.SubjectDobHash = kataster.politicians.DobHash
            GROUP BY
                Id, FirstName, Surname, Title
        )
        SELECT DISTINCT ON (PoliticianCounts.Id)
            PoliticianCounts.*,
            kataster.politicianterms.picture_url AS picture,
            kataster.parties.abbreviation AS party_abbreviation,
            kataster.parties.name AS party_nom,
            kataster.terms.start AS term_start,
            kataster.terms.finish AS term_finish,
            kataster.offices.name_male AS office_name_male,
            kataster.offices.name_female AS office_name_female
        FROM
            PoliticianCounts
        JOIN
            kataster.politicianterms ON kataster.politicianterms.politicianid=Id
        JOIN
            kataster.terms ON kataster.terms.id=kataster.politicianterms.termid
        JOIN
            kataster.offices ON kataster.offices.id=kataster.terms.officeid
        JOIN
            kataster.parties ON kataster.parties.id=kataster.politicianterms.party_nomid
        ORDER BY
            PoliticianCounts.Id, kataster.terms.finish DESC
        ;"""
    rows = db_query(db, q)
    return rows
