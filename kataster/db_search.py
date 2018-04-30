#!/usr/bin/env python
# -*- coding: utf-8 -*-
from utils import Mercator_to_WGS84


def get_politician_by_PersonId(db, PersonId):
    q = """
        SELECT DISTINCT ON (Persons.Id)
            Persons.surname AS surname,
            Persons.firstname AS firstname,
            Persons.title AS title,
            PersonTerms.picture_url AS picture,
            Parties.abbreviation AS party_abbreviation,
            Parties.name AS party_nom,
            Terms.start AS term_start,
            Terms.finish AS term_finish,
            Offices.name_male AS office_name_male,
            Offices.name_female AS office_name_female
        FROM
            Persons
        JOIN
            PersonTerms ON PersonTerms.PersonId=Persons.id
        JOIN
            Terms ON Terms.id=PersonTerms.termid
        JOIN
            Offices ON Offices.id=Terms.officeid
        JOIN
            Parties ON Parties.id=PersonTerms.party_nomid
        WHERE
            Persons.Id=%s
        ORDER BY
            Persons.Id, Terms.finish DESC
        ;"""
    q_data = (PersonId,)
    politicians = db.query(q, q_data)
    assert len(politicians) <= 1
    if len(politicians) == 0:
        return None
    else:
        return politicians[0]

def get_Parcels_owned_by_Person(db, PersonId):
    q = """
        SELECT DISTINCT ON (CadastralUnitCode, FolioNo, ParcelNo)
            Parcels.No AS ParcelNo,
            0.5 * (Parcels.minX + Parcels.maxX) AS MercatorX,
            0.5 * (Parcels.minY + Parcels.maxY) AS MercatorY,
            Folios.No AS FolioNo,
            LandUses.Name AS LandUseName,
            CadastralUnits.Code AS CadastralUnitCode,
            CadastralUnits.Name AS CadastralUnitName
        FROM
            Parcels
        INNER JOIN
            LandUses ON LandUses.Id=Parcels.LandUseId
        INNER JOIN
            CadastralUnits ON CadastralUnits.Id=Parcels.CadastralUnitId
        INNER JOIN
            Folios ON Folios.Id=Parcels.FolioId
        INNER JOIN
            PersonFolios ON PersonFolios.FolioId=Folios.Id
        WHERE
            PersonFolios.PersonId=%s
        ORDER BY
            CadastralUnitCode, FolioNo, ParcelNo, Parcels.ValidTo DESC
        ;"""
    q_data = (PersonId,)
    rows = db.query(q, q_data)

    # Convert the coordinates to WGS84
    for row in rows:
        row['lat'], row['lon'] = Mercator_to_WGS84(row['mercatorx'], row['mercatory'])
        del row['mercatorx']
        del row['mercatory']

    return rows

def get_politicians_with_Folio_counts(db):
    q = """
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
            Persons.Id AS Id,
            Persons.FirstName AS FirstName,
            Persons.Surname AS Surname,
            Persons.Title AS Title,
            PersonCounts.num_houses_flats AS num_houses_flats,
            PersonCounts.num_fields_gardens AS num_fields_gardens,
            PersonCounts.num_others AS num_others,
            PersonTerms.picture_url AS picture,
            Parties.abbreviation AS party_abbreviation,
            Parties.name AS party_nom,
            Terms.start AS term_start,
            Terms.finish AS term_finish,
            Offices.name_male AS office_name_male,
            Offices.name_female AS office_name_female
        FROM
            Persons
        INNER JOIN
            AssetDeclarations ON AssetDeclarations.PersonId=Persons.Id
        JOIN
            PersonCounts ON PersonCounts.PersonId=Persons.Id
        JOIN
            PersonTerms ON PersonTerms.PersonId=Persons.Id
        JOIN
            Terms ON Terms.id=PersonTerms.TermId
        JOIN
            Offices ON Offices.id=Terms.OfficeId
        JOIN
            Parties ON Parties.id=PersonTerms.party_nomid
        WHERE
            AssetDeclarations.Year=2016
        ORDER BY
            Persons.Id, Terms.finish DESC
        ;"""
    rows = db.query(q)
    return rows

def get_asset_declarations(db, PersonId):
    q = """
        SELECT
            unmovable_assets,
            movable_assets,
            income,
            compensations,
            other_income,
            offices_other,
            year,
            source
        FROM
            AssetDeclarations
        WHERE
            PersonId=%s
        ORDER BY
            year DESC
        ;"""
    q_data = (PersonId,)
    declarations = db.query(q, q_data)
    return declarations
