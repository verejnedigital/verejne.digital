# -*- coding: utf-8 -*-
import os
import sys
import yaml

from psycopg2.extensions import AsIs

import geocoder as geocoder_lib
import entities

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../data/db')))
from db import DatabaseConnection

def CreateAndSetProdSchema(db, prod_schema_name):
    """ Initialized schema with core prod tables: Entities and Addresses.
    
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
            CREATE TABLE Addresses (
                id SERIAL PRIMARY KEY,
                lat DOUBLE PRECISION,
                lng DOUBLE PRECISION,
                address TEXT
            )
        """)

        cur.execute("""
            CREATE TABLE Entities (
                id SERIAL PRIMARY KEY,
                name TEXT,
                address_id INTEGER REFERENCES Addresses(id)
            )
        """)
        


def ProcessSource(db_source, db_prod, geocoder, entities, config):
    """ Process one source table (read from db_source) using the config and
    performing normalization using the given geocoder and entities lookup.

    The produced data are written into db_prod connection. The function writes
    new entities and addresses in to the Entities and Address tables. It also
    creates and populates supplementary tables as specified by a config.
    """
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
        columns = columns_for_table[table]
        values = [row[column] for column in columns]
        if all(v is None for v in values):
            # Ignore this entry, all meaningful values are None
            return

        # TODO: find out how to build SQL statement properly
        column_names = ",".join(["eid"] + columns)
        values_params = ",".join(["%s"] * (1 + len(columns)))
        command = (
                "INSERT INTO %s (" + column_names + ") " +
                "VALUES (" + values_params + ")"
        )
        with db_prod.dict_cursor() as cur:
            cur.execute(command,
                        [AsIs(table), eid] + [row[column] for column in columns])

    with db_source.dict_cursor() as cur:
        # Read data using the given command.
        cur.execute(config["command"])
        missed = 0
        found = 0;

        missed_eid = 0
        found_eid = 0
        for row in cur:
            # Read entries one by one and try to geocode them. If the address
            # lookup succeeds, try to normalize the entities. If it succeeds,
            # insert into Entities and supplementary tables.
            address = row["address"]
            if address is None: continue
            name = row["name"]
            if name is None: continue

            addressId = geocoder.GetAddressId(address.encode("utf8"))
            if addressId is None:
                missed += 1
                continue
            found += 1;

            eid = entities.GetEntity(row["ico"], name, addressId)
            print name, "-> eid:", eid
            
            if config["save_org_id"]:
                entities.AddOrg2Eid(row["org_id"], eid)
            if config["use_org_id_as_eid_relation"]:
                row["eid_relation"] = entities.GetEidForOrgId(row["org_id"])
                
            if eid is None: missed_eid += 1
            found_eid += 1
            for table in columns_for_table:
                AddToTable(row, table, eid)

    print "FOUND", found
    print "MISSED", missed
    print "FOUND EID", found_eid
    print "MISSED EID", missed_eid



def main():
    # TODO: make this a parameter
    # Write output into prod_schema_name
    prod_schema_name = "prod_20180303000001"
    # Read source from soruce_schema_name
    source_schema_name = "source_ekosystem_rpo_20180303000000"

    # Create three database connections:
    # Read geocoder cache from this one
    db_old = DatabaseConnection(path_config='db_config_cache_table')
    # Read source tables from this one
    db_source = DatabaseConnection(path_config='db_config_update_source.yaml',
                                   search_path=source_schema_name)
    # Write prod tables into this one
    db_prod = DatabaseConnection(path_config='db_config_update_source.yaml')
    CreateAndSetProdSchema(db_prod, prod_schema_name)

    # Initialize geocoder
    geocoder = geocoder_lib.Geocoder(db_old, db_prod, "mysql.Entities")
    # Initialize entity lookup
    entities_lookup = entities.Entities(db_prod)
    # Table prod_tables.yaml defines a specifications of SQL selects to read
    # source data and describtion of additional tables to be created.
    with open('prod_tables.yaml', 'r') as stream:
        config = yaml.load(stream)
    # This is where all the population happens!!!
    # Go through all the specified data sources and process them, adding data
    # as needed.
    for key in config.keys:
        print 'X',key
        config = config[key]
        print 'XX',key,config[key]
        ProcessSource(db_source, db_prod, geocoder, entities_lookup, config)


    db_old.commit()
    db_old.close()
    db_prod.conn.rollback()
    #db_prod.commit()
    #db_prod.close()

    db_source.commit()
    db_source.close()

    print "STATS"
    print "CACHE HITS", geocoder.cache_hit
    print "CACHE MISS", geocoder.cache_miss
    pass

if __name__ == '__main__':
    main()
