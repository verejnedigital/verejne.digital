#!/usr/bin/env python
# -*- coding: utf-8 -*-
import json
import psycopg2
import psycopg2.extras
import yaml

def log(s):
    print "LOG: " + s

def read_entities_mock():
    entity_names = ["Jan Novak", "Jana Novakova", "Peter Novak", "Fei Wu", "Li Weng", "Bc. Jan Novak, PhD.", "Mgr. Jan Novak ZIVNOSTNIK"]
    ids = [22, 41, 77, 13, 14, 24, 25]
    lats = [0.15, 0.18, 0.18, 0.20, 0.20, 0.15, 0.15]
    lngs = [0.22, 0.19, 0.19, 0.21, 0.21, 0.22, 0.22]
    return entity_names, ids, lats, lngs

def read_entities():
    # Connect to database
    log("Connecting to the database")
    with open("db_config.yaml", "r") as stream:
        config = yaml.load(stream)

    db = psycopg2.connect(user=config["user"], dbname=config["db"])
    cur = db.cursor(cursor_factory=psycopg2.extras.DictCursor)
    cur.execute("SET search_path = 'mysql'")

    sql = "SELECT entity_name,id,lat,lng FROM entities LIMIT %s"
    cur.execute(sql, [int(config["relations_to_load"])])
    entity_names = []
    ids = []
    lats = []
    lngs = []
    for row in cur:
        entity_names.append(row["entity_name"].decode('utf-8'))
        ids.append(row["id"])
        lats.append(row["lat"])
        lngs.append(row["lng"])
    cur.close()
    db.close()

    log("DONE")
    return entity_names,ids,lats,lngs

def update_eids_of_ids(ids, eids):
    print "Updating id", len(ids), len(eids)

def update_eids_of_companies():
    # Connect to database
    log("Connecting to the database")
    with open("db_config.yaml", "r") as stream:
        config = yaml.load(stream)

    db = psycopg2.connect(user=config["user"], dbname=config["db"])
    cur = db.cursor(cursor_factory=psycopg2.extras.DictCursor)
    cur.execute("SET search_path = 'mysql'")

    sql = "((SELECT ico, id FROM firmy_data WHERE (ico > 10000) and id IS NOT NULL) union " \
        + "(SELECT ico, id FROM new_orsr_data WHERE (ico > 10000) and id IS NOT NULL) union " \
        + "(SELECT ico, id FROM orsresd_data WHERE (ico > 10000) and id IS NOT NULL)) ORDER BY ico LIMIT %s"
    cur.execute(sql, [int(config["relations_to_load"])])
    ids = []
    eids = []
    last_ico = -1
    last_eid = -1
    for row in cur:
        current_eid = row["id"]
        current_ico = row["ico"]
        if (last_ico == current_ico):
            ids.append(current_eid)
            eids.append(last_eid);
            current_eid = last_eid
        last_ico = current_ico
        last_eid = current_eid

    cur.close()
    db.close()
    log("DONE")
    update_eids_of_ids(ids, eids)
    return ids, eids

if __name__ == '__main__':
    update_eids_of_companies()
