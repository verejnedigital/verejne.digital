#!/usr/bin/env python
# -*- coding: utf-8 -*-
import json
import psycopg2
import psycopg2.extras
import yaml

def log(s):
    print "LOG: " + s

def read_entities_mock():
    return ["Jan Novak", "Jana Novakova", "Peter Novak"],[22, 41, 77],[0.15, 0.18, 0.18],[0.22, 0.19, 0.19] 

def read_entities():
    # Connect to database
    log("Connecting to the database")
    with open("db_config.yaml", "r") as stream:
        config = yaml.load(stream)

    db = psycopg2.connect(user=config["user"], dbname=config["db"])
    cur = db.cursor(cursor_factory=psycopg2.extras.DictCursor)
    cur.execute("SET search_path = 'mysql'")

    log("relations constructor")
    sql = "SELECT entity_name,id,lat,lng FROM entities LIMIT %s"
    cur.execute(sql, [int(config["relations_to_load"])])
    entity_names = []
    ids = []
    lats = []
    lngs = []
    for row in cur:
        entity_names.append(row["entity_name"])
        ids.append(row["id"])
        lats.append(row["lat"])
        lngs.append(row["lng"])
    cur.close()
    db.close()

    log("DONE")
    return entity_names,ids,lats,lngs
