#!/usr/bin/env python
# -*- coding: utf-8 -*-
import datetime


# --- UTILITY METHODS ---
def _convert_dates_to_strings(row):
    """ Given a database row returned by psycopg2,
        convert all dates to strings (usually used
        to ensure JSON serialisability). """
    for key in row:
        if type(row[key]) == datetime.date:
            row[key] = str(row[key])


# --- SUMMARY QUERIES ---
def _add_summary_query(db, query, eIDs, result, field):
    # Query the database
    query_data = [tuple(eIDs)]
    rows = db.query(query, query_data)

    # Store database responses in the result dictionary
    for row in rows:
        eID = row['eid']
        del row['eid']
        _convert_dates_to_strings(row)
        result[eID][field] = row

def _add_eufunds_summary(db, eIDs, result):
    q = """
        SELECT
            entities.id AS eid,
            -- Count rows with non-null eufunds only
            COUNT(eufunds.id) AS eufunds_count,
            -- In the sum, replace NULL value (sum of empty set) with 0
            COALESCE(SUM(price), 0) AS eufunds_price_sum
        FROM
            entities
        INNER JOIN
            eufunds ON eufunds.eid=entities.id
        WHERE
            entities.id IN %s
        GROUP BY
            entities.id
        ;"""
    _add_summary_query(db, q, eIDs, result, 'eufunds')

def _add_companyinfo(db, eIDs, result):
    q = """
        SELECT
            entities.id AS eid,
            companyinfo.ico,
            companyinfo.established_on,
            companyinfo.terminated_on
        FROM
            entities
        INNER JOIN
            companyinfo ON companyinfo.eid=entities.id
        WHERE
            entities.id IN %s
        ;"""
    _add_summary_query(db, q, eIDs, result, 'companyinfo')

def _add_contracts_summary(db, eIDs, result):
    q = """
        SELECT
            entities.id AS eid,
            COUNT(contracts.id) AS count,
            SUM(contract_price_amount) AS price_amount_sum
        FROM
            entities
        INNER JOIN
            contracts ON contracts.supplier_eid=entities.id
        WHERE
            entities.id IN %s
        GROUP BY
            entities.id
        ;"""
    _add_summary_query(db, q, eIDs, result, 'contracts')

def _add_notices_summary(db, eIDs, result):
    q = """
        SELECT
            entities.id AS eid,
            COUNT(notices.id) AS count,
            -- Sum total_final_value_amount where currency is EUR
            SUM(total_final_value_amount) FILTER (WHERE total_final_value_currency='EUR') AS total_final_value_amount_eur_sum
        FROM
            entities
        INNER JOIN
            notices ON notices.supplier_eid=entities.id
        WHERE
            entities.id IN %s
        GROUP BY
            entities.id
        ;"""
    _add_summary_query(db, q, eIDs, result, 'notices')


# --- LATERAL QUERIES ---
def _add_lateral_query(db, query, eIDs, result, field, subfield, max_rows_per_eID):
    """ Executes a LATERAL JOIN query and stores the resulting rows
        for each eID as a list in result[eID][field][subfield].
    """

    # Query the database
    query_data = [max_rows_per_eID, tuple(eIDs)]
    rows = db.query(query, query_data)

    # Store database responses in the result dictionary
    for row in rows:
        # Ensure insertion location exists in the result JSON
        eID = row['eid']
        if field not in result[eID]:
            result[eID][field] = {}
        if subfield not in result[eID][field]:
            result[eID][field][subfield] = []

        # Prepare the row for insertion into the JSON and insert
        del row['eid']
        _convert_dates_to_strings(row)
        result[eID][field][subfield].append(row)

def _add_eufunds_largest(db, eIDs, result, max_per_eID):
    q = """
        SELECT
            entities.id AS eid,
            eid_eufunds.*
        FROM
            entities,
            LATERAL (
                SELECT
                    title, link, price, state, call_state, call_title
                FROM
                    eufunds
                WHERE
                    eufunds.eid=entities.id
                ORDER BY
                    price DESC
                LIMIT
                    %s
            ) eid_eufunds
        WHERE
            entities.id IN %s
        ;"""
    _add_lateral_query(db, q, eIDs, result, 'eufunds', 'largest', max_per_eID)

def _add_companyfinancials(db, eIDs, result):
    q = """
        SELECT
            entities.id AS eid,
            companyfinancials.year,
            companyfinancials.revenue,
            companyfinancials.profit,
            companyfinancials.employees
        FROM
            entities
        INNER JOIN
            companyfinancials ON companyfinancials.eid=entities.id
        WHERE
            entities.id IN %s
        ;"""
    q_data = [tuple(eIDs)]
    rows = db.query(q, q_data)

    # Store database responses in the result dictionary
    for row in rows:
        eID = row['eid']
        if 'companyfinancials' not in result[eID]:
            result[eID]['companyfinancials'] = {}
        year = row['year']
        del row['eid']
        del row['year']
        result[eID]['companyfinancials'][year] = row

def _add_contracts_top(db, eIDs, filter_and_order, result, subfield, max_per_eID):
    q = """
        SELECT
            entities.id AS eid,
            eid_contracts.*,
            entities_client.name AS client_name
        FROM
            entities,
            LATERAL (
                SELECT
                    eid AS client_eid,
                    id,
                    contract_price_amount,
                    contract_price_total_amount,
                    signed_on,
                    effective_from,
                    effective_to,
                    status_id,
                    contract_id,
                    contract_identifier
                FROM
                    contracts
                WHERE
                    contracts.supplier_eid=entities.id
        """ + filter_and_order + """
                LIMIT
                    %s
            ) eid_contracts
        INNER JOIN
            entities AS entities_client ON entities_client.id=eid_contracts.client_eid
        WHERE
            entities.id IN %s
        ;"""
    _add_lateral_query(db, q, eIDs, result, 'contracts', subfield, max_per_eID)

def _add_contracts_recents(db, eIDs, result, max_per_eID):
    filter_and_order = """
        ORDER BY signed_on DESC
    """
    subfield = 'most_recent'
    _add_contracts_top(db, eIDs, filter_and_order, result, subfield, max_per_eID)

def _add_contracts_largest(db, eIDs, result, max_per_eID):
    filter_and_order = """
        ORDER BY contract_price_amount DESC
    """
    subfield = 'largest'
    _add_contracts_top(db, eIDs, filter_and_order, result, subfield, max_per_eID)

def _add_notices_top(db, eIDs, filter_and_order, result, subfield, max_per_eID):
    q = """
        SELECT
            entities.id AS eid,
            eid_notices.*,
            entities_client.name AS client_name
        FROM
            entities,
            LATERAL (
                SELECT
                    eid AS client_eid,
                    id,
                    notice_id,
                    contract_id,
                    title,
                    estimated_value_amount,
                    estimated_value_currency,
                    bulletin_issue_id,
                    notice_type_id,
                    short_description,
                    total_final_value_amount,
                    total_final_value_currency,
                    body
                FROM
                    notices
                WHERE
                    notices.supplier_eid=entities.id
        """ + filter_and_order + """
                LIMIT
                    %s
            ) eid_notices
        INNER JOIN
            entities AS entities_client ON entities_client.id=eid_notices.client_eid
        WHERE
            entities.id IN %s
        ;"""
    _add_lateral_query(db, q, eIDs, result, 'notices', subfield, max_per_eID)

def _add_notices_recents(db, eIDs, result, max_per_eID):
    filter_and_order = """
        ORDER BY bulletin_issue_id DESC
    """
    subfield = 'most_recent'
    _add_notices_top(db, eIDs, filter_and_order, result, subfield, max_per_eID)

def _add_notices_largest(db, eIDs, result, max_per_eID):
    filter_and_order = """
            AND total_final_value_currency='EUR'
        ORDER BY
            total_final_value_amount DESC
    """
    subfield = 'largest'
    _add_notices_top(db, eIDs, filter_and_order, result, subfield, max_per_eID)


# --- MAIN METHOD ---
def get_GetInfos(db, eIDs):
    """Returns information about entities with the given eIDs.

    Args:
      db: An open database connection with `search_path` set to the
          current production schema.
      eIDs: A list of integers, the entity IDs ("eIDs") for which
          information is being requested.
    Returns:
      Dictionary of the form {eID: information}, where `information`
      is itself a dictionary mapping keys to corresponding values
      about the entity with id `eID`.
    """

    # Parameters controlling how much information to return:
    max_eufunds_largest = 15
    max_contracts_recents = 5
    max_contracts_largest = 15
    max_notices_recent = 5

    # Initialise result dictionary:
    result = {eID: {} for eID in eIDs}

    # If the input list `eIDs` is empty, return straight away. This is
    # necessary as PostgreSQL doesn't handle an empty WHERE IN clause.
    if len(eIDs) == 0:
        return result

    # Query the database for basic entity information:
    q = """
        SELECT
          entities.id AS eid, entities.name, address.lat, address.lng, address.address
        FROM
          entities
        JOIN
          address ON address.id=entities.address_id
        WHERE
          entities.id IN %s
        ;"""
    q_data = [tuple(eIDs)]
    for row in db.query(q, q_data):
        eID = row['eid']
        result[eID] = row
        del result[eID]['eid']
        result[eID]['related'] = []

    # Add information from other production tables
    _add_eufunds_summary(db, eIDs, result)
    _add_eufunds_largest(db, eIDs, result, max_eufunds_largest)
    _add_companyfinancials(db, eIDs, result)
    _add_companyinfo(db, eIDs, result)
    _add_contracts_summary(db, eIDs, result)
    _add_contracts_recents(db, eIDs, result, max_contracts_recents)
    _add_contracts_largest(db, eIDs, result, max_contracts_largest)
    _add_notices_summary(db, eIDs, result)
    _add_notices_recents(db, eIDs, result, max_notices_recent)
    _add_notices_largest(db, eIDs, result, max_notices_recent)

    # Query the database for related entities
    q = """
        WITH merged AS (
          /* Add reverse edges with negative stakeholder_type_id. */
          SELECT
            related.eid AS source,
            related.eid_relation AS target,
            +1 * related.stakeholder_type_id AS edge_type,
            stakeholdertypes.stakeholder_type_text AS edge_type_text
          FROM
            related
          LEFT JOIN
            stakeholdertypes
          ON
            stakeholdertypes.stakeholder_type_id =
                related.stakeholder_type_id
          WHERE
            related.eid IN %s AND related.eid<>related.eid_relation
          UNION
          SELECT
            related.eid_relation AS source,
            related.eid AS target,
            -1 * related.stakeholder_type_id AS edge_type,
            stakeholdertypes.stakeholder_type_text AS edge_type_text
          FROM
            related
          LEFT JOIN
            stakeholdertypes
          ON
            stakeholdertypes.stakeholder_type_id =
                related.stakeholder_type_id
          WHERE
            related.eid_relation IN %s AND related.eid<>related.eid_relation
        ),
        grouped AS (
          /* Group edges going from same souce to same destination. */
          SELECT
            merged.source,
            merged.target,
            array_agg(merged.edge_type) AS edge_types,
            array_agg(merged.edge_type_text) AS edge_type_texts
          FROM merged
          GROUP BY (merged.source, merged.target)
        )
        SELECT
          grouped.source AS eid_source,
          grouped.target AS eid,
          grouped.edge_types,
          grouped.edge_type_texts,
          entities.name, address.lat, address.lng, address.address
        FROM
          grouped
        JOIN
          entities ON entities.id=grouped.target
        JOIN
          address ON address.id=entities.address_id
        ;
        """
    q_data = [tuple(eIDs), tuple(eIDs)]
    for row in db.query(q, q_data):
        eID = row['eid_source']
        result[eID]['related'].append(row)
        del result[eID]['related'][-1]['eid_source']

    return result
