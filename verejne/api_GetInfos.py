#!/usr/bin/env python
# -*- coding: utf-8 -*-

def get_GetInfos(db, eIDs):
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
