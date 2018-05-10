# -*- coding: utf-8 -*-
import argparse
import os
import sys
import yaml
import re
import xml.etree.ElementTree as ET
from psycopg2.extensions import AsIs

import geocoder as geocoder_lib
import entities
from datetime import datetime

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../data/db')))
from db import DatabaseConnection

def ExtractDescriptionFromBody(body):
    """ Input is the raw body of raw_notice.
    This method extracts description from it and returns it. 
    """
    if body is None: return None
    root = ET.fromstring(body)
    if root is None: return None
    components = ["opisPredmetuObstaravania", "opisZakazky"]
    for e in root.iter():
        if (e.attrib.get("FormComponentId", None) in components) and \
            ("Value" in e.attrib):
            return e.attrib["Value"].replace("\n", " ")
    return None

def CreateAndSetProdSchema(db, prod_schema_name):
    """ Initialized schema with core prod tables: Entities and Address.
    
    Creates tabales under given scheman (which is created) in the given db
    connection.

    Finally it sets the connection to use the just created schema.
    """
    with db.dict_cursor() as cur:
        cur.execute("CREATE SCHEMA %s", [AsIs(prod_schema_name)])
        cur.execute("SET search_path = %s", [AsIs(prod_schema_name)])
        # TODO: read this from a config
        # TODO: index on lat, lng
        cur.execute("""
            CREATE TABLE Address (
                id SERIAL PRIMARY KEY,
                lat DOUBLE PRECISION,
                lng DOUBLE PRECISION,
                address TEXT
            );
            CREATE INDEX ON Address (lat);
            CREATE INDEX ON Address (lng);
            CREATE UNIQUE INDEX ON Address (lat, lng);
            CREATE INDEX addresses_box_spgist_idx ON address USING spgist (point(lat, lng));
        """)

        cur.execute("""
            CREATE TABLE Entities (
                id SERIAL PRIMARY KEY,
                name TEXT,
                address_id INTEGER REFERENCES Address(id)
            )
        """)
        

def ProcessSource(db_prod, geocoder, entities, config, test_mode):
    """ Process one source table (read from db_source) using the config and
    performing normalization using the given geocoder and entities lookup.

    The produced data are written into db_prod connection. The function writes
    new entities and addresses in to the Entities and Address tables. It also
    creates and populates supplementary tables as specified by a config.
    """

    # Connect to the most recent schema from the current source
    db_source = DatabaseConnection(path_config='db_config_update_source.yaml')
    source_schema_name = db_source.get_latest_schema('source_' + config["source_schema"])
    print "Processing source_schema_name", source_schema_name
    db_source.execute('SET search_path="' + source_schema_name + '";')

    columns_for_table = {}
    with db_prod.dict_cursor() as cur:
        # Create supplementaty tables using the provided command.
        # Also store the columns of the table for later use.
        for table in config["tables"]:
            table_config = config["tables"][table]
            columns_for_table[table] = table_config["columns"]
            cur.execute(table_config["create_command"])

    def AddToTable(row, table, eid):
        """ Add values for the given row into the supplementary table 'table'.

        It reads the corresponding values from the row and adds them into the
        table with the corresponding eid.
        """
        columns = list(columns_for_table[table])
        values = [row[column] for column in columns]
        if eid is not None:
            columns += ["eid"]
            values += [eid]
        if all(v is None for v in values):
            # Ignore this entry, all meaningful values are None
            return

        # TODO: find out how to build SQL statement properly
        column_names = ",".join(columns)
        values_params = ",".join(["%s"] * (len(columns)))
        command = (
                "INSERT INTO %s (" + column_names + ") " +
                "VALUES (" + values_params + ") " +
                "ON CONFLICT DO NOTHING"
        )
        with db_prod.dict_cursor() as cur:
            cur.execute(command,
                        [AsIs(table)] + values)

    with db_source.dict_cursor() as cur:
        # Read data using the given command.
        print "Executing SQL command ..."
        suffix_for_testing = ""
        if test_mode:
            suffix_for_testing = " LIMIT 1000"
        cur.execute(config["command"] + suffix_for_testing)
        print "Done."
        missed = 0
        found = 0
        empty = 0

        missed_eid = 0
        found_eid = 0

        missed_addresses = set([])
        for row in cur:
            # Read entries one by one and try to geocode them. If the address
            # lookup succeeds, try to normalize the entities. If it succeeds,
            # insert into Entities and supplementary tables.
            address = ""
            if "address" in row:
                address = row["address"]
                if address is None: continue
            name = ""
            if "name" in row:
                name = row["name"]
                if name is None: continue
            # Sometimes FirstName and Surname are joined. Lets try the simplest splitting on Capital
            # letters.
            if (len(name.split()) == 1):
              name = ' '.join(re.findall('[A-Z][^A-Z]*', name))
            addressId = geocoder.GetAddressId(address.encode("utf8"))
            if addressId is None:
                if test_mode and missed < 10:
                    print "MISSING ADDRESS", address.encode("utf8")
                if address == "":
                    empty += 1
                else:
                    missed_addresses.add(address)
                    missed += 1
                    continue
            found += 1;
            
            eid = None
            if config.get("no_entity_id"):
                eid = None
            else:
                eid = entities.GetEntity(row["ico"], name, addressId)
            # print name, "-> eid:", eid
            if found%20000==0:
                print "Progress:", found
                sys.stdout.flush()

            if config.get("save_org_id"):
                entities.AddOrg2Eid(row["org_id"], eid)
            if config.get("use_org_id_as_eid_relation"):
                eid2 = entities.GetEidForOrgId(row["eid_relation"])
                if eid2 is None:
                  continue
                row["eid_relation"] = eid2 
            if config.get("extract_description_from_body"):
                row["body"] = ExtractDescriptionFromBody(row["body"])

            if eid is None: missed_eid += 1
            found_eid += 1
            for table in columns_for_table:
                AddToTable(row, table, eid)

    print "FOUND", found
    print "MISSED", missed
    print "EMPTY", empty
    print "MISSED UNIQUE", len(missed_addresses)
    print "FOUND EID", found_eid
    print "MISSED EID", missed_eid
    db_source.close()


def main(args_dict):
    test_mode = not args_dict['disable_test_mode']
    if test_mode:
        print "======================="
        print "=======TEST MODE======="
        print "======================="

    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    # Write output into prod_schema_name
    prod_schema_name = "prod_" + timestamp
    print "prod_schema_name", prod_schema_name

    # Create database connections:
    # Read / write address cache from this one
    db_address_cache = DatabaseConnection(
        path_config='db_config_update_source.yaml', search_path='address_cache')
    # Write prod tables into this one
    db_prod = DatabaseConnection(path_config='db_config_update_source.yaml')
    CreateAndSetProdSchema(db_prod, prod_schema_name)

    # Initialize geocoder
    geocoder = geocoder_lib.Geocoder(db_address_cache, db_prod, test_mode)
    # Initialize entity lookup
    entities_lookup = entities.Entities(db_prod)
    # Table prod_tables.yaml defines a specifications of SQL selects to read
    # source data and describtion of additional tables to be created.
    with open('prod_tables.yaml', 'r') as stream:
        config = yaml.load(stream)
    # This is where all the population happens!!!
    # Go through all the specified data sources and process them, adding data
    # as needed.
    # We have two loops to process first the primary source of entities.
    for key in config.keys():
        config_per_source = config[key]
        if config_per_source.get("is_primary"):
            print "Working on source:", key
            ProcessSource(db_prod, geocoder, entities_lookup, config_per_source, test_mode)
    for key in config.keys():
        config_per_source = config[key]
        if not config_per_source.get("is_primary"):
            print "Working on source:", key
            ProcessSource(db_prod, geocoder, entities_lookup, config_per_source, test_mode)

    # Grant apps read-only access to the newly created schema and tables within
    db_prod.grant_usage_and_select_on_schema(prod_schema_name, 'verejne')
    db_prod.grant_usage_and_select_on_schema(prod_schema_name, 'kataster')

    # Commit database changes and close database connections
    db_address_cache.commit()
    db_address_cache.close()
    if test_mode:
        db_prod.conn.rollback()
    else:
        db_prod.commit()
        db_prod.close()

    print "STATS"
    geocoder.PrintStats()


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--disable_test_mode', default=False, action='store_true', help='Disable test mode')
    args_dict = vars(parser.parse_args())
    main(args_dict)
