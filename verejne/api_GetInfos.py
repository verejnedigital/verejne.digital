#!/usr/bin/env python
# -*- coding: utf-8 -*-
import datetime


# --- SUMMARY QUERIES ---
def _add_summary_query(db, query, eIDs, result):
    # Query the database
    query_data = [tuple(eIDs)]
    rows = db.query(query, query_data)

    # Store database responses in the result dictionary
    for row in rows:
        eID = row['eid']
        del row['eid']
        result[eID].update(row)

def _add_eufunds_summary(db, eIDs, result):
    q = """
        SELECT
            entities.id AS eid,
            -- Count rows with non-null contracts only
            COUNT(eufunds.id) AS eufunds_count,
            -- In the sum, replace NULL value (sum of empty set) with 0
            COALESCE(SUM(price), 0) AS eufunds_price_sum
        FROM
            entities
        LEFT JOIN
            eufunds ON eufunds.eid=entities.id
        WHERE
            entities.id IN %s
        GROUP BY
            entities.id
        ;"""
    _add_summary_query(db, q, eIDs, result)

def _add_contracts_summary(db, eIDs, result):
    q = """
        SELECT
            entities.id AS eid,
            -- Count rows with non-null contracts only
            COUNT(contracts.id) AS contracts_count,
            -- In the sum, replace NULL value (sum of empty set) with 0
            COALESCE(SUM(contract_price_amount), 0) AS contracts_price_amount_sum
        FROM
            entities
        LEFT JOIN
            contracts ON contracts.supplier_eid=entities.id
        WHERE
            entities.id IN %s
        GROUP BY
            entities.id
        ;"""
    _add_summary_query(db, q, eIDs, result)


# --- LATERAL QUERIES ---
def _add_lateral_query(db, query, eIDs, result, field, max_rows_per_eID):
    """ Executes a LATERAL JOIN query and stores the resulting rows
        for each eID as a list in result[eID][field].
    """

    # Initialise fields where information will be added
    for eID in result:
        result[eID][field] = []

    # Query the database
    query_data = [max_rows_per_eID, tuple(eIDs)]
    rows = db.query(query, query_data)

    # Store database responses in the result dictionary
    for row in rows:
        eID = row['eid']
        del row['eid']
        for key in row:
            if type(row[key]) == datetime.date:
                row[key] = str(row[key]) # for JSON serialisability
        result[eID][field].append(row)

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
    _add_lateral_query(db, q, eIDs, result, 'eufunds_largest', max_per_eID)

def _add_contracts_recents(db, eIDs, result, max_per_eID):
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
                    contract_price_amount,
                    contract_price_total_amount,
                    signed_on,
                    status_id,
                    contract_id,
                    contract_identifier
                FROM
                    contracts
                WHERE
                    contracts.supplier_eid=entities.id
                ORDER BY
                    signed_on DESC
                LIMIT
                    %s
            ) eid_contracts
        INNER JOIN
            entities AS entities_client ON entities_client.id=eid_contracts.client_eid
        WHERE
            entities.id IN %s
        ;"""
    _add_lateral_query(db, q, eIDs, result, 'contracts_most_recent', max_per_eID)

def _add_contracts_largest(db, eIDs, result, max_per_eID):
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
                    contract_price_amount,
                    contract_price_total_amount,
                    signed_on,
                    status_id,
                    contract_id,
                    contract_identifier
                FROM
                    contracts
                WHERE
                    contracts.supplier_eid=entities.id
                ORDER BY
                    contract_price_amount DESC
                LIMIT
                    %s
            ) eid_contracts
        INNER JOIN
            entities AS entities_client ON entities_client.id=eid_contracts.client_eid
        WHERE
            entities.id IN %s
        ;"""
    _add_lateral_query(db, q, eIDs, result, 'contracts_largest', max_per_eID)


# --- MAIN METHOD ---
def get_GetInfos(db, eIDs):
    # Parameters
    max_eufunds_largest = 15
    max_contracts_recents = 5
    max_contracts_largest = 15

    # Initialise result dictionary
    result = {eID: {} for eID in eIDs}

    # Query the database for basic entity information
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
    _add_contracts_summary(db, eIDs, result)
    _add_contracts_recents(db, eIDs, result, max_contracts_recents)
    _add_contracts_largest(db, eIDs, result, max_contracts_largest)

    # Query the database for related entities
    q = """
        SELECT
            related.eid AS eid_source,
            related.eid_relation AS eid,
            related.stakeholder_type_id,
            entities.name, address.lat, address.lng, address.address
        FROM
            related
        JOIN
            entities ON entities.id=related.eid_relation
        JOIN
            address ON address.id=entities.address_id
        WHERE
            related.eid IN %s
        ;"""
    q_data = [tuple(eIDs)]
    for row in db.query(q, q_data):
        eID = row['eid_source']
        result[eID]['related'].append(row)
        del result[eID]['related'][-1]['eid_source']

    return result
