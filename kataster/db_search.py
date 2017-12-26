#!/usr/bin/env python
# -*- coding: utf-8 -*-
from db import db_connect, db_query
from utils import search_string, Mercator_to_WGS84


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
    q = """SET search_path TO kataster;"""
    q += """
        WITH
        PersonCounts AS (
            SELECT
                Persons.Id AS PersonId,
                COUNT(DISTINCT (Folios.CadastralUnitId, Folios.No)) FILTER
                    (WHERE LandUses.Name = 'Zastavaná plocha a nádvorie')
                    AS num_houses_flats,
                COUNT(DISTINCT (Folios.CadastralUnitId, Folios.No)) FILTER
                    (WHERE LandUses.Name = 'Orná pôda' OR LandUses.Name = 'Záhrada')
                    AS num_fields_gardens,
                COUNT(DISTINCT (Folios.CadastralUnitId, Folios.No)) FILTER
                    (WHERE LandUses.Name != 'Zastavaná plocha a nádvorie' AND LandUses.Name != 'Orná pôda' AND LandUses.Name != 'Záhrada')
                    AS num_others
            FROM
                Persons
            LEFT OUTER JOIN
                PersonFolios ON PersonFolios.PersonId=Persons.Id
            LEFT OUTER JOIN
                Folios ON Folios.Id=PersonFolios.FolioId
            LEFT OUTER JOIN
                Parcels ON Parcels.FolioId=Folios.Id
            LEFT OUTER JOIN
                LandUses ON LandUses.Id = Parcels.LandUseId
            GROUP BY
                Persons.Id
        )
        SELECT DISTINCT ON (Persons.Id)
            Persons.FirstName AS FirstName,
            Persons.Surname AS Surname,
            Persons.Title AS Title,
            PersonCounts.num_houses_flats AS num_houses_flats,
            PersonCounts.num_fields_gardens AS num_fields_gardens,
            PersonCounts.num_others AS num_others,
            PersonTerms.picture_url AS picture,
            Parties2.abbreviation AS party_abbreviation,
            Parties2.name AS party_nom,
            Terms2.start AS term_start,
            Terms2.finish AS term_finish,
            Offices2.name_male AS office_name_male,
            Offices2.name_female AS office_name_female
        FROM
            Persons
        INNER JOIN
            AssetDeclarations2 ON AssetDeclarations2.PersonId=Persons.Id
        JOIN
            PersonCounts ON PersonCounts.PersonId=Persons.Id
        JOIN
            PersonTerms ON PersonTerms.PersonId=Persons.Id
        JOIN
            Terms2 ON Terms2.id=PersonTerms.TermId
        JOIN
            Offices2 ON Offices2.id=Terms2.OfficeId
        JOIN
            Parties2 ON Parties2.id=PersonTerms.party_nomid
        WHERE
            AssetDeclarations2.Year=2016
        ORDER BY
            Persons.Id, Terms2.finish DESC
        ;"""
    rows = db_query(db, q)
    return rows

def get_asset_declarations(firstname, surname):
    db = db_connect()
    q = """
        SELECT
            unmovable_assets,
            movable_assets,
            income,
            compensations,
            other_income,
            offices_other,
            year
        FROM
            kataster.AssetDeclarations
        WHERE
            firstname=%s AND surname=%s
        ORDER BY
            year DESC
        ;"""
    q_data = (firstname, surname)
    declarations = db_query(db, q, q_data)
    db.close()
    return declarations
