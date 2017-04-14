#!/usr/bin/env python
# -*- coding: utf-8 -*-
import argparse
import ast
# TODO: add to geoocode_db_utils
import db
import json
import logging
import psycopg2.extras
from psycopg2.extensions import AsIs
import sys
import time
import urllib
import yaml

# Load the key we use for geocoding addressed
# TODO: have a config file for this
geocode_key = None
with open("/tmp/geocode_key.txt", 'r') as f:
    geocode_key = yaml.load(f)['key']
#db.parser.add_argument("--related", help="Only compute related table", action="store_true")
#db.parser.add_argument("--populate_has_data", help="Updates values so we know for which data we have somthing to show", action="store_true")

db = db.db_connect()
logging.basicConfig(
        format='%(asctime)s %(levelname)s: %(message)s',
        datefmt='%m/%d/%Y %I:%M:%S %p', level=logging.DEBUG)

# global variable for tracking number of api call
api_calls = 0

# Return dictionary cursor and use mysql.* paths for tables
def getCursor(set_search_path='mysql'):
    global db
    cur = db.cursor(cursor_factory=psycopg2.extras.DictCursor)
    if set_search_path: cur.execute("SET search_path = %s", [set_search_path])
    return cur

def executeAndLog(cur, sql, params=None):
    command = cur.mogrify(sql, params)
    logging.info("SQL: " + command)
    cur.execute(command)

# inserts the given dictionary {(column_name: value} into the given table
# returns the id of the inserted row
# if returnIDColumn is not None, also return 'RETURNIN returnIdColumn'
def insertDictionary(table, d, returnIDColumn=None):
    with getCursor() as cur:
        columns = d.keys()
        values = [d[column] for column in columns]
        values_string = ','.join(["%s"] * len(values))
        sql = 'INSERT INTO %s (%s) VALUES (' + values_string + ')'
        if returnIDColumn is not None: sql += 'RETURNING ' + returnIDColumn
        executeAndLog(cur, sql, [AsIs(table), AsIs(', '.join(columns))] + values)
        if returnIDColumn is not None: return cur.fetchone()[0]

class IdMaster:
    # mappings
    #  (has(name), address) -> id
    #  (hash(name), (lat, lng)) -> id
    #  (hash(address)) -> id
    name_address = {}
    name_lat_lng = {}
    address_data = {}

    def __init__(self):
        #load table to memory
        logging.info("Loading ids")
        cur = getCursor()
        executeAndLog(cur,
                "SELECT id, entity_name, address, original_address, lat, lng FROM entities")
        for row in cur:
            norm_name = self.normalize(row["entity_name"]) 
            logging.info(norm_name)
            norm_address = self.normalize(row["address"])
            norm_orig_address = self.normalize(row["original_address"])
            t_address = (hash(norm_name), hash(norm_address))
            t_orig_address = (hash(norm_name), hash(norm_orig_address))
            t_lat_lng = (hash(norm_name), hash((str(row["lat"]), str(row["lng"]))))
            self.name_address[t_address] = row["id"]
            self.name_address[t_orig_address] = row["id"]
            self.name_lat_lng[t_lat_lng] = row["id"]
            self.address_data[hash(norm_orig_address)] = row["id"]
        cur.close()
        logging.info("Loading done")

    # normalize string be removing spaces, dots, commas and turning everything into lower cases
    # TODO: normalize upper case letters with diacritics
    def normalize(self, s):
        return s.lower().replace(" ", "").replace("."," ").replace(",", "")

    # load json for the provided entities.id 
    def getJSONForId(self, row_id):
        logging.info("getJSONForId: " + str(row_id))
        with getCursor() as cur:
            executeAndLog(cur, "SELECT json FROM entities WHERE id=%s", [row_id])
            return json.loads(cur.fetchone()["json"])
    
    # gecoodes given address.
    # returns json as returned by the GoogleAPI
    # the json is also stored in the database, so first the method checks whether
    # the hash of the provided address is stored in self.address_data
    # if the address cannot be geocoded, the method iteratively strips the first
    # word until it can geocode the address
    def geocode(self, address, mock=True):
        global api_calls, geocode_key
        logging.info("Geocoding: " + address)
        if mock:
            # TODO: fix unicode
            with open('tmp/address.json') as data_file:
                    text = data_file.read()
                    d = ast.literal_eval(text)
                    return d["results"][0]
            return ""
       
        split = address.split(" ")
        for i in range(len(split)):
            # Let's ignore the first i words
            attempted = " ".join(split[i:]) 
            # lookup if has been already geocoded
            norm_address = self.normalize(attempted)
            if (hash(norm_address) in self.address_data):
                return self.getJSONForId(self.address_data[hash(norm_address)])
            # Build a request to the maps api
            # TODO: also add viewport biasing to slovakia
            params = {
                'address': attempted.encode('utf-8'),
                'region': 'sk',
                'key': geocode_key
            }
            url = "https://maps.googleapis.com/maps/api/geocode/json?" + urllib.urlencode(params)
            try:
                response = urllib.urlopen(url)
                data = json.loads(response.read())
                api_calls += 1
                if data["status"] == 'OK':
                    return data["results"]
            except:
                pass
            logging.info("Unable to geocode: (" + attempted + ") removing first word")

        return None

    # get entities.eid for the given (name, address)
    # if the pair is already is in the database, return the eid
    # otherwise create new entry in entities
    # Note this method tries to normalize the address (by geocoding to lat, lng)
    # as well as name, byt normalizing the string
    def getId(self, name, address):
        def toUnicode(s):
          if isinstance(s, str): return s.decode("utf8")
          return s

        name = toUnicode(name)
        address = toUnicode(address)

        norm_name = self.normalize(name)
        norm_address = self.normalize(address)
        t_address = (hash(norm_name), hash(norm_address))
        if t_address in self.name_address:
            return self.name_address[t_address]
        djson = self.geocode(address, False)
        if djson is None:
            logging.info("Address " + address + "geocoded to None")
            return None
        g = djson[0]
        if g is None:
            logging.info("Address " + address + "geocoded to None")
            return None
        lat_n = g["geometry"]["location"]["lat"]
        lng_n = g["geometry"]["location"]["lng"]
        lat = "%3.7f" % lat_n
        lng = "%3.7f" % lng_n

        logging.info(address + " -> " + str(lat) + ", " + str(lng))

        t_lat_lng = (hash(norm_name), hash((lat, lng)))
        if (t_lat_lng) in self.name_lat_lng:
            return self.name_lat_lng[t_lat_lng]
        #add to table
        data = {
            "address" : g["formatted_address"],
            "original_address": address,
            "entity_name": name,
            "json": json.dumps(djson),
            "lat": lat,
            "lng": lng
        }

        with getCursor() as cur:
            # Add entry into entities. As this is new entity, we set its eid=id.
            # However, before inserting the entry, we don't know id, so initially insert
            # -1 and then set eid to match.
            data["eid" ] = -1
            row_id = int(insertDictionary("entities", data, returnIDColumn='id'))
            # remember the id for the various representations
            logging.info("Added id " + str(row_id))
            self.address_data[hash(norm_address)] = row_id
            self.name_address[t_address] = row_id
            self.name_lat_lng[t_lat_lng] = row_id
            executeAndLog(cur, "UPDATE entities SET eid=%s WHERE id=%s", [row_id, row_id])
        return row_id

# returns set(ids) of ids that were already geocoded in the previous rus
def getGeocodedIds(table_name):
    logging.info("getGeocodedIds " + table_name)
    result = set()
    with getCursor() as cur:
      sql = "SELECT orig_id FROM " + table_name
      executeAndLog(cur, sql)
      for row in cur: result.add(row["orig_id"])
    return result

master = None

# TODO: document all the params
# The master method to gecoode raw data into our format
# Take 'input_table' and 
#    1) geocode it: transforms 'address_column' into lat long,
#    2) add new entities to entities table,
#    3) column 'id_column' is the column with identifiers in the 'input_table'.
#       The method creates 'input_table'_geocoded_" table which contains
#       mappings between ids from 'id_column' and entities.id for the
#       corresponding new record in entities table
#    4) name of the added entities is extracted from 'name_column'
#    5) 'extra_columns' = dist{column_name: new_column_name} is a dictionary.
#       Keys are names of columns from input_table that get also extracted from
#       the input table. The data are extracted into table called 'new_table_name'
#       and the column names are the values in the 'extra_columns' dictionary.
#       As as convention, new_table_name = `source_name`_data
#    6) to keep track from which source individual entries in entities table
#       came from, the method adds new boolean column 'source_name', which is
#       true if the data came from that particular source.

def checkTableExists(table):
    with getCursor() as cur:
        executeAndLog(cur,
                "SELECT * FROM information_schema.tables WHERE table_name=%s",
                [table])
        exists = bool(cur.rowcount)
        logging.info("Exists %s = %s", table, exists)
        return exists

def getColumnType(table, column):
    with getCursor() as cur:
        executeAndLog(cur,
                "SELECT data_type FROM information_schema.columns " +
                "WHERE table_name = %s AND column_name = %s",
                [table, column])
        try:
            column_type = cur.fetchone()[0]
        except:
            logging.info("columns does not exist")
            return None
        logging.info("Type %s.%s => %s", table, column, column_type)
        return column_type


def geocodeTable(
    input_table, name_column, address_column, id_column, source_name,
    new_table_name, extra_columns, max_process=None, address_like=None,
    address_like_column=None, geocoded_table=None, input_table_search_path='public'):
    global api_calls, master

    # Here's to the crazy ones:
    # Create `input_table'_geocoded
    if id_column is not None:
        logging.info("Creating geocoded table")
        # Default to *_geocoded_, unless provided otherwise.
        geocoded_id_table = input_table + "_geocoded_" \
                if geocoded_table is None else geocoded_table

        if not checkTableExists(geocoded_id_table):
            with getCursor() as new_cursor:
                getColumnType(input_table, id_column)
                executeAndLog(new_cursor, 
                    "CREATE TABLE " + geocoded_id_table + "("
                    "orig_id " + getColumnType(input_table, id_column) + " PRIMARY KEY,"
                    "new_id INTEGER)")
  
    # Create table with extra column
    if ((new_table_name is not None) and
        (not checkTableExists(new_table_name))):
        logging.info("Creatting table: " + new_table_name)
        new_table_sql = "CREATE TABLE " + new_table_name + " (id INTEGER"
        for column in extra_columns:
            new_table_sql += (
                ", " + extra_columns[column] + " " + getColumnType(input_table, column))
        new_table_sql += ", FOREIGN KEY (id) REFERENCES entities(id))"
        with getCursor() as new_cursor:
            executeAndLog(new_cursor, new_table_sql)

    # add tag column into entities denoting the source
    # todo: having columns is quite bad, turn this into a table as it should be.
    if (getColumnType("entities", source_name) is None):
        logging.info("Adding column to entities")
        with getCursor() as new_cursor:
            executeAndLog(new_cursor,
                    "ALTER TABLE entities ADD " + source_name + " BOOL")

    # Build select statement, which extracts id, name, addres and extra column
    # from the input table
    select_sql = \
            "SELECT " + \
            (", ".join([id_column,
                       name_column + " as name",
                       address_column + " as address"] + \
                       extra_columns.keys())) + \
            " FROM " + input_table

    if address_like is not None:
        select_sql += " WHERE " + \
                (address_column if address_like_column is None else address_like_column) + \
                " LIKE \"%" + address_like + "%\""
    else:
        # Requires address is not null
        select_sql += " WHERE " + address_column + " IS NOT NULL"
    logging.info(select_sql)
    not_geocoded = 0
    geocoded_ids = getGeocodedIds(geocoded_id_table)
    
    remaining = max_process if max_process is not None else 100
    processed = 0
    not_geocoded = 0
    skipped = 0
    # dirty trick to escape from 'mysql' search_path. Todo: figure out proper
    # search_paths for different kinds of tables
    cur = getCursor(set_search_path=input_table_search_path)
    executeAndLog(cur, select_sql)
    for row in cur:
        # For each row, if not procesed already,
        # geocode, add new row into entities,
        # copy extra_columns into 'new_table_name'
        # and mark new record in entities as coming from this source.
        api_calls_before = api_calls
        processed += 1
        if (processed % 1000 == 0):
            logging.info("Total number of rows processed: " + str(processed) +
                ", remaining: " + str(remaining) + ", skipped: " + str(skipped))
            logging.info("Not geocoded: " + str(not_geocoded))

        if (row[id_column] in geocoded_ids):
            skipped += 1
            continue
        to_id = master.getId(row["name"], row["address"])
        if (to_id is None):
            not_geocoded += 1
        if id_column is not None:
            insertDictionary(geocoded_id_table,
                {"orig_id": row[id_column], "new_id": to_id})
        if (new_table_name is not None):
            new_data = {"id": to_id}
            for column in extra_columns:
                new_data[extra_columns[column]] = row[column]
            insertDictionary(new_table_name, new_data)
            
        with getCursor() as new_cursor:
            executeAndLog(new_cursor,
                    "UPDATE entities SET " + source_name + "=TRUE WHERE id=%s", [to_id])
        geocoded_ids.add(row[id_column])
        remaining -= (api_calls - api_calls_before)
        # processed requested number of api calls. stop
        if (remaining <= 0): break
    cur.close()


def nullOrEmpty(x):
    return "CASE WHEN " + x + " is NULL THEN '' ELSE " + x + " END"

def getConcat(x, y, z=None):
    s="concat(" + nullOrEmpty(x) + ", \" \", " + nullOrEmpty(y)
    if not z is None: s += ", \" \", " + nullOrEmpty(z)
    s += ")"
    return s 

def getConcatList(l):
  s = ", ' ', ".join([nullOrEmpty(x) for x in l])
  return "TRIM(CONCAT(" + s + "))"

def getNewId(table_name):
    return table_name + ".new_id"

def getMapping(table_name):
    result = {}
    cur = db.getCursor()
    from_index = 0
    batch_size = 33333
    while True:
      sql = "SELECT new_id, orig_id FROM " + table_name + \
             " LIMIT " + str(batch_size) + " OFFSET " + str(from_index)
      db.execute(cur, sql)
      processed = False;
      for row in cur.fetchall():
          processed = True
          result[row["orig_id"]] = row["new_id"]
      if not processed: break
      from_index += batch_size
    return result

# TODO: rewrite this to postgres
def populateRelated(relationship_table, colA, colB, tableA, tableB):
    print "populateRelated", relationship_table
    cur = db.getCursor()
    mapSql = "SELECT id, eid FROM entities"
    db.execute(cur, mapSql)
    id_to_eid = {}
    for row in cur.fetchall():
       id_to_eid[row["id"]] = row["eid"]

    print "loading mapping"
    mapA = getMapping(tableA)
    mapB = getMapping(tableB)
    print "mapping loaded"
    sql = "SELECT " + colA + ", " + colB + " FROM " + relationship_table
    cur = db.getCursor()
    db.execute(cur, sql)
    index = 0
    for row in cur.fetchall(): 
        index += 1
        if (index % 50 == 0): 
          print "index", index
          db.db.commit()
        valA = row.get(colA, None)
        valB = row.get(colB, None)
        if (valA is not None) and (valB is not None) and (valA in mapA) and (valB in mapB):
            newA = mapA[valA]
            newB = mapB[valB]
            if not newA in id_to_eid:
              logging.info("Missing " + str(newA) + " in id_to_eid")
              continue
            if not newB in id_to_eid:
              logging.info("Missing " + str(newB) + " in id_to_eid")
              continue
            db.insertDictionary("related",
                {"id1": newA, "eid1": id_to_eid[newA],
                 "id2": newB, "eid2": id_to_eid[newB]})
    db.db.commit()
    
# TODO: rewrite this to postgres
def processRelated():
    logging.info("processRelated")
    cur = db.getCursor()
    db.execute(cur, "DELETE FROM related")
    db.db.commit()
    populateRelated("people_esd", "organization_id", "record_id",
        "orsresd_geocoded_", "people_esd_geocoded_")
    populateRelated("orsr_relationships", "id_osoby", "id_firmy",
        "orsr_persons_geocoded_", "firmy_unified2_geocoded_")
    populateRelated("relation", "_record_id", "_record_id",
        "relation_from_geocoded_", "relation_to_geocoded_")

def process(limit):
    afp_original_db_id = "_record_id"

    esd_address = (
        "if(address_formatted is not null, address_formatted, " + \
        getConcatList(["address_street", "address_building_number", "address_municipality",
                       "address_postal_code", "address_country"]) + ")"
    )

    geocodeTable("people_esd",
        "IF(full_name IS NOT NULL, full_name, person_formatted_name)",
        esd_address, "record_id", "people_esd", "people_esd_data",
        {"note": "note"}, limit, address_like=None)


    esd_address = (
        "if(formatted_address is not null, formatted_address, " + \
        getConcatList(["street", "building_number", "municipality", "postal_code", "country"]) + ")"
    )

    # orsr from ekosystem.slovensko.digital
    geocodeTable("orsresd",
        "name", esd_address, "id", "orsresd", "orsresd_data", {"ipo": "ico"}, limit, address_like=None)

   # Old ORSR
  # before geocoding this, check whether there's an overlap with the other ORSR
#    geocodeTable("orsr_persons",
#        "meno", "adresa", "id_osoby", "orsr_persons", None, {}, limit, address_like=None)
#
#    geocodeTable("firmy_unified2",
#        "nazov", "adresa", "id", "orsr_companies", "firmy_data",
#        {"ico": "ico" , "pravna_forma": "pravna_forma", "start": "start", "end": "end"},
#        limit, address_like=None)
    #Zivnostentsky register
    geocodeTable("zrsr",
        "name", getConcat("address1", "address2"), "id",
        "zrsr", "zrsr_data", {"ico": "ico", "active": "active"}, limit, address_like=None)
    return
    #Uzivatelia vyhody - ludia
    geocodeTable("uzivatelia_vyhody",
        "meno", "adresa", "record_id",
        "uzivatelia_vyhody_clovek", "uzivatelia_vyhody_ludia_data",
        {"funkcionar": "funkcionar"}, limit,
        geocoded_table="vyhodia_ludia_geocode", address_like=None)

    #Uzivatelia vyhody - firmy
    geocodeTable("uzivatelia_vyhody",
        "spolocnost", "adresa_spolocnosti", "record_id",
        "uzivatelia_vyhody_firma", "uzivatelia_vyhody_firmy_data",
        {"ico": "ico", "forma": "forma"}, limit,
        geocoded_table="vyhody_firmy_geocode", address_like=None)
    
    return
    # DataNest tables 
    geocodeTable("ds_sponzori_stran",
        getConcat("meno_darcu", "priezvisko_darcu", "firma_darcu"), "adresa_darcu",
        afp_original_db_id, "ds_sponzori_stran", "sponzori_stran_data",
        {"hodnota_daru": "hodnota_daru", "strana": "strana", "rok": "rok"},
        limit, address_like=None)

    geocodeTable("ds_stranicke_clenske_prispevky",
        getConcat("meno", "priezvisko"), getConcat("adresa", "mesto"),
        afp_original_db_id, "ds_stranicke_prispevky", "stranicke_prispevky_data",
        {"strana": "strana", "rok": "rok", "vyska_prispevku": "vyska_prispevku", "mena": "mena"},
        limit, address_like=None)
    
    geocodeTable("ds_advokati",
        getConcat("meno_advokata", "priezvisko_advokata"), getConcat("adresa", "mesto", "psc"),
        "afp_original_db_id", "ds_advokati", "advokati_data",
        {"telefonne_cislo" : "telefonne_cislo"}, limit, address_like=None)

    geocodeTable("ds_nadacie",
        getConcat("meno_spravcu", "priezvisko_spravcu"), "adresa_spravcu",
        afp_original_db_id, "ds_nadacie_spravca", None, {}, limit,
        address_like=None, geocoded_table="ds_nadacie_spravca_geocoded_") 

    geocodeTable("ds_nadacie",
        "nazov_nadacie", "adresa_nadacie", afp_original_db_id, "ds_nadacie", 
        "nadacie_data", {"ico_nadacie": "ico_nadacie", "hodnota_imania": "hodnota_imania",
        "poznamka": "poznamka", "ucel_nadacie": "ucel_nadacie"},
        limit, address_like=None)

    geocodeTable("ds_dotacie_audiovizfond",
        getConcat("first_name", "last_name", "company"),
        getConcat("address", "zip_code", "town"),
        "_record_id", "ds_dotacie_audiovizfond", "audiovizfond_data",
        {"amount": "amount", "currency": "currency", "subsidy_subject": "subsidy_subject", "year": "year"},
        limit, address_like=None)

    geocodeTable("ds_auditori", 
        getConcat("meno", "priezvisko", "firma"), getConcat("adresa", "mesto", "psc"),
        afp_original_db_id, "ds_auditori", "auditori_data",
        {"cislo_licencie" : "cislo_licencie", "typ_auditora" : "typ_auditora"},
        limit, address_like=None)

    return

    geocodeTable("ds_danovi_dlznici", 
        getConcat("meno", "priezvisko"), getConcat("adresa", "mesto"),
        afp_original_db_id, "ds_danovi_dlznici", "danovi_dlznici_data",
        {"danovy_nedoplatok": "danovy_nedoplatok", "zdroj": "zdroj", "mena": "mena"},
        limit, address_like=None) 

# ORSR data
    geocodeTable("relation",
        "rel_name", "rel_address", afp_original_db_id, "new_orsr", None, {},
        limit, address_like=None, address_like_column="city",
        geocoded_table="relation_to_geocoded_")
    
    geocodeTable("relation",
        "name", getConcat("street", "city", "psc"), afp_original_db_id,
        "new_orsr", "new_orsr_data", {"ico": "ico", "url": "url", "start": "start"},
        limit, address_like=None, address_like_column="rel_address",
        geocoded_table="relation_from_geocoded_")


def populateHasData():
    with open("../verejne/datasources.yaml", "r") as f:
        data_sources = yaml.load(f)
    cur = db.getCursor()
    if (db.getColumnType("entities", "has_data") is None):
        db.execute(cur, "ALTER TABLE entities ADD has_data BOOL")
        db.db.commit()

    cur = db.execute(cur, "UPDATE entities SET has_data = NULL")
    db.db.commit()

    print "Populating has_data based on related"
    sql = "UPDATE entities JOIN related ON entities.id = related.id1 SET entities.has_data=true"
    cur = db.execute(cur, sql)
    db.db.commit()
    sql = "UPDATE entities JOIN related ON entities.id = related.id2 SET entities.has_data=true"
    cur = db.execute(cur, sql)
    db.db.commit()

    print "Populating has_data based on contracts"
    sql = "UPDATE entities JOIN contracts ON entities.id = contracts.id SET entities.has_data=true" 
    cur = db.execute(cur, sql)
    db.db.commit()

    for table in data_sources:
        if table == "entities": continue
        print "Populating has data for", table
        condition = " OR ".join([column + " IS NOT NULL" for column in data_sources[table]])

        sql = "UPDATE entities " + \
            "JOIN " + table + " ON entities.id = " + table + ".id " + \
            "SET entities.has_data=true " + \
            "WHERE " + condition
        cur = db.execute(cur, sql)
        db.db.commit()

#if db.args.related:
#  logging.info("OnlyComputingRelated")
#  processRelated()
#elif db.args.populate_has_data:
#  logging.info("populate_has_data")
#  populateHasData()
#else:
if False:
    # Here's an example how to geocode a particular table.
    master = IdMaster()
    geocodeTable(
            input_table='politicians', 
            name_column=getConcatList(["title", "firstname", "surname"]),
            address_column="address",
            id_column="id",
            source_name="politicians",
            new_table_name="politicians_data",
            extra_columns={
                "title": "title",
                "firstname": "firstname",
                "surname": "surname",
                "email": "email",
                "office_id": "office_id",
                "term_start": "term_start",
                "term_end": "term_end",
                "party_nom": "party_nom",
                "party": "party",
                "source": "source",
                "picture": "picture"},
            max_process=1000000
    )

populateHasData()

# Everything done, commit and close the connection
logging.info("Commiting!")
db.commit()
#db.rollback()
db.close()
logging.info("API Calls: " + str(api_calls))
