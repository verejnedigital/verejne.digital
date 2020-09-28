#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""Functions for retrieving information from the database."""

import re

from utils import Mercator_to_WGS84


def get_politician_by_PersonId(db, PersonId):
    q = """
        SELECT DISTINCT ON (Persons.Id)
          Persons.surname AS surname,
          Persons.firstname AS firstname,
          Persons.title AS title,
          PersonOffices.picture_url AS picture,
    
          -- TODO(matejbalog): Fields below temporarily kept for
          -- backward compatibility. Remove when no longer needed.
          Parties.abbreviation AS party_abbreviation,
          Parties.name AS party_nom,
          PersonOffices.term_start AS term_start,
          PersonOffices.term_end AS term_finish,
          Offices.name_male AS office_name_male,
          Offices.name_female AS office_name_female,
          income_graphs_jsons.json_plot AS json_plots
        FROM
          Persons
        INNER JOIN
          PersonOffices ON PersonOffices.PersonId=Persons.id
        INNER JOIN
          Offices ON Offices.id=PersonOffices.officeid
        LEFT JOIN
          Parties ON Parties.id=PersonOffices.party_nomid
        LEFT JOIN
          income_graphs_jsons ON income_graphs_jsons.person_id=Persons.id
        WHERE
          Persons.Id=%s
        ORDER BY
          Persons.Id, PersonOffices.term_end DESC
        ;"""
    q_data = (PersonId,)
    politicians = db.query(q, q_data)
    assert len(politicians) <= 1
    if len(politicians) == 0:
        return None
    else:
        return politicians[0]


def get_offices_of_person(db, person_id):
    """Returns a list of offices held by person with `person_id`."""
    query = """
        SELECT
          Parties.abbreviation AS party_abbreviation,
          Parties.name AS party_nom,
          PersonOffices.term_start AS term_start,
          PersonOffices.term_end AS term_finish,
          Offices.name_male AS office_name_male,
          Offices.name_female AS office_name_female
        FROM
          Persons
        INNER JOIN
          PersonOffices ON PersonOffices.PersonId=Persons.id
        INNER JOIN
          Offices ON Offices.id=PersonOffices.officeid
        LEFT JOIN
          Parties ON Parties.id=PersonOffices.party_nomid
        WHERE
          Persons.Id=%s
        ORDER BY
          PersonOffices.term_end DESC
        ;"""
    return db.query(query, [person_id])


def _is_matching_name(name, person):
    """Returns whether `name` is deemed to "match" `person`."""

    firstname = person['firstname']
    surname = person['surname']
    name_tokens = re.split(' |-', name)
    firstname_match = (
            firstname in name_tokens or
            (firstname == 'Robert' and 'Róbert' in name_tokens) or
            (firstname == 'Róbert' and 'Robert' in name_tokens) or
            (firstname == 'Marian' and 'Marián' in name_tokens) or
            (firstname == 'Marián' and 'Marian' in name_tokens))
    surname_match = surname in name_tokens
    return (firstname_match and surname_match)


def get_eids_with_matching_name(db, person, verbose=False):
    """Returns an iterable of eids with names matching `person`.

    Args:
        db: DatabaseConnection with search_path set to production schema.
        person: Dict containing (at least) "firstname" and "surname".
        verbose: Boolean indicating whether to report failed matches.
    Returns:
        Iterable of integers, the eids of entities with name matching the
        name of `person`.
    """
    person_name = '{0} {1}'.format(person['firstname'], person['surname'])
    rows = db.query(
        """
        SELECT entities.id AS eid, entities.name, lat, lng
        FROM entities_search
        INNER JOIN entities ON entities.id=entities_search.id
        INNER JOIN address ON address.id=entities.address_id
        WHERE
          search_vector @@ plainto_tsquery('simple', unaccent(%s))
          AND (lat <> 49.137092 OR lng <> 20.4312365);
        """,
        [person_name]
    )
    for row in rows:
        if _is_matching_name(row['name'], person):
            yield row['eid']
        elif verbose:
            print("%s did not match (%s, %s)!" % (
                row['name'], person['firstname'], person['surname']))


def get_folios_uses_of_person(db, person_id):
    """Returns unique (Folio, LandUse) pairs owned by `person_id`."""

    # Check that person_id has a recent asset declaration, or is
    # currently running for office.
    rows = db.query("""
    SELECT
        1
    FROM
        Persons
    INNER JOIN
        PersonOffices ON PersonOffices.PersonId=Persons.Id
    INNER JOIN
        Offices ON Offices.Id=PersonOffices.OfficeId
    LEFT JOIN
        AssetDeclarations ON AssetDeclarations.PersonId=Persons.Id
    WHERE
        Persons.Id=%s
        AND (
            AssetDeclarations.Year>=2016
            OR (
                PersonOffices.term_end>=2018
                AND Offices.name_male IN (
                    'kandidát na primátora Bratislavy',
                    'kandidát na prezidenta SR'
                )
            )
      )
    """, [person_id])
    if len(rows) == 0:
        print("WARNING: Person id %d is not allowed." % person_id)
        return []

    rows = db.query("""
        SELECT
            CadastralUnits.Code AS CadastralUnitCode,
            MIN(CadastralUnits.Name) AS CadastralUnitName,
            Folios.No AS FolioNo,
            LandUses.Name AS LandUseName,
            string_agg(Parcels.No, ', ') AS ParcelNo,
            AVG(0.5 * (Parcels.minX + Parcels.maxX)) AS MercatorX,
            AVG(0.5 * (Parcels.minY + Parcels.maxY)) AS MercatorY
        FROM
            Folios
        INNER JOIN
            CadastralUnits ON CadastralUnits.Id=Folios.CadastralUnitId
        INNER JOIN
            PersonFolios ON PersonFolios.FolioId=Folios.Id
        LEFT JOIN
            Parcels ON Parcels.FolioId=Folios.Id
        LEFT JOIN
            LandUses ON LandUses.Id=Parcels.LandUseId
        WHERE
            PersonFolios.PersonId=%s
        GROUP BY
            CadastralUnitCode, FolioNo, LandUses.Name
      """, [person_id])

    # Convert Mercator coordinates (if present) to WGS84.
    for row in rows:
        if row['mercatorx'] and row['mercatory']:
            row['lat'], row['lon'] = Mercator_to_WGS84(row['mercatorx'], row['mercatory'])
        else:
            row['lat'], row['lon'] = None, None
        del row['mercatorx']
        del row['mercatory']

    return rows


def get_politicians_with_Folio_counts(db, query_filter):
    """Returns a list of politicians with asset counts."""
    q = """
        WITH
            PersonCounts AS (
        SELECT
            Persons.Id AS PersonId,
            COUNT(DISTINCT (Folios.CadastralUnitId, Folios.No)) FILTER
                (WHERE LandUses.Name = 'Zastavaná plocha a nádvorie' OR LandUses.Id IS NULL)
                AS num_houses_flats,
            COUNT(DISTINCT (Folios.CadastralUnitId, Folios.No)) FILTER
                (WHERE LandUses.Name = 'Orná pôda' OR LandUses.Name = 'Záhrada')
                AS num_fields_gardens,
            COUNT(DISTINCT (Folios.CadastralUnitId, Folios.No)) FILTER
                (WHERE LandUses.Id IS NOT NULL
                    AND LandUses.Name != 'Zastavaná plocha a nádvorie'
                    AND LandUses.Name != 'Orná pôda'
                    AND LandUses.Name != 'Záhrada')
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
            PersonOffices.picture_url AS picture,
            Parties.abbreviation AS party_abbreviation,
            Parties.name AS party_nom,
            PersonOffices.term_start AS term_start,
            PersonOffices.term_end AS term_finish,
            Offices.name_male AS office_name_male,
            Offices.name_female AS office_name_female,
            incomes.income AS latest_income
        FROM
            Persons
        LEFT JOIN
            AssetDeclarations ON AssetDeclarations.PersonId=Persons.Id
        LEFT JOIN
            incomes ON incomes.asset_declaration_id=AssetDeclarations.Id
        INNER JOIN
            PersonCounts ON PersonCounts.PersonId=Persons.Id
        INNER JOIN
            PersonOffices ON PersonOffices.PersonId=Persons.Id
        INNER JOIN
            Offices ON Offices.id=PersonOffices.OfficeId
        LEFT JOIN
            Parties ON Parties.id=PersonOffices.party_nomid
        WHERE
            """ + query_filter + """
        ORDER BY
            Persons.Id,
            -- Mild hack to prefer country-level offices over others.
            Offices.level ASC,
            PersonOffices.term_end DESC,
            AssetDeclarations.year DESC
            ;"""
    rows = db.query(q)
    return rows


def get_asset_declarations(db, PersonId):
    """Returns a list of asset declarations for a given PersonId."""
    q = """
        SELECT
            unmovable_assets,
            num_houses,
            num_fields,
            num_others,
            movable_assets,
            AssetDeclarations.income as income,
            compensations,
            other_income,
            offices_other,
        year,
            source,
            incomes.income as parsed_income
        FROM
            AssetDeclarations
        JOIN
            incomes ON incomes.asset_declaration_id = AssetDeclarations.id
        WHERE
            PersonId=%s
        ORDER BY
            year DESC
        ;"""
    q_data = (PersonId,)
    declarations = db.query(q, q_data)
    return declarations
