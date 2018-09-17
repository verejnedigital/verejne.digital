# -*- coding: utf-8 -*-
import argparse
import os
import sys
import tqdm
import yaml
import re
import HTMLParser
import xml.etree.ElementTree as ET
from psycopg2.extensions import AsIs

import geocoder as geocoder_lib
import entities
from prod_generation import graph_tools
import post_process
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

def StripHtml(text):
    """ Input is html fragment. Output is text without html tags. """
    if (text is None):
        return ""
    p = re.compile(r'<.*?>')
    return HTMLParser.HTMLParser().unescape(p.sub('', text)).replace(u'\xa0', u' ')

def CreateAndSetProdSchema(db, prod_schema_name):
    """ Initialized schema with core prod tables: Entities and Address.

    Creates tabales under given scheman (which is created) in the given db
    connection.

    Finally it sets the connection to use the just created schema.
    """
    with db.dict_cursor() as cur:
        cur.execute("CREATE SCHEMA %s", [AsIs(prod_schema_name)])
        cur.execute("SET search_path = public,%s", [AsIs(prod_schema_name)])
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
            );
            CREATE INDEX ON Entities(name);
            CREATE INDEX ON Entities(address_id);
            CREATE MATERIALIZED VIEW entities_search AS SELECT id, to_tsvector('simple',unaccent(name)) as search_vector FROM entities WITH NO DATA;
            CREATE INDEX ON entities_search(search_vector);
            CREATE INDEX ON entities_search USING gin(search_vector);
        """)


# TODO(rasto): refactor this method: split it into individual parts, so that
# the main ProcessSource is short without deep nesting
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

    def AddValuesToTable(columns, values, eid, supplier_eid=None):
        if eid is not None:
            columns += ["eid"]
            values += [eid]
        if supplier_eid is not None:
            columns += ["supplier_eid"]
            values += [supplier_eid]

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

    def AddToTable(row, table, eid, years, supplier_eid=None):
        """ Add values for the given row into the supplementary table 'table'.

        It reads the corresponding values from the row and adds them into the
        table with the corresponding eid.
        """
        columns = list(columns_for_table[table])
        if years:
            for year in years:
                values = []
                columns_per_year = columns[:]
                for column in columns:
                    col_name = column + "_" + str(year)
                    if col_name in row:
                        values.append(row[col_name])
                    else:
                        values.append(None)
                columns_per_year.append("year")
                values.append(year)
                AddValuesToTable(columns_per_year, values, eid)
        else:
            values = [row[column] for column in columns]
            AddValuesToTable(columns, values, eid, supplier_eid)

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
                if address == "":
                    empty += 1
                else:
                    if test_mode and missed < 10:
                        print "MISSING ADDRESS", address.encode("utf8")
                    missed_addresses.add(address)
                    missed += 1
                    continue
            found += 1;

            eid = None
            if config.get("no_entity_id"):
                # TODO(rasto): is the address lookup necessary here?
                eid = None
            else:
                eid = entities.GetEntity(row["ico"], name, addressId)

            if found % 20000 == 0:
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
            supplier_eid = None
            if config.get("supplier_eid"):
                supplier_address_id = None
                if "supplier_address" in row and not row["supplier_address"] is None:
                    supplier_address = row["supplier_address"]
                    if supplier_address:
                        supplier_address_id = geocoder.GetAddressId(supplier_address.encode("utf8"))
                        if supplier_address_id is None:
                            missed_addresses.add(supplier_address)
                            missed += 1
                            continue
                    else:
                        empty += 1
                supplier_name = ""
                if "supplier_name" in row and not row["supplier_name"] is None:
                    supplier_name = row["supplier_name"]
                supplier_eid = entities.GetEntity(row["supplier_ico"], supplier_name, supplier_address_id)
            if table_config.get("strip_html"):
                for strip_html_column in table_config["strip_html"]:
                    if row.get(strip_html_column):
                        row[strip_html_column] = StripHtml(row[strip_html_column])
            if eid is None: missed_eid += 1
            found_eid += 1
            AddToTable(row, table, eid, table_config.get("years"), supplier_eid)

    print "FOUND", found
    print "MISSED", missed
    print "EMPTY", empty
    print "MISSED UNIQUE", len(missed_addresses)
    print "FOUND EID", found_eid
    print "MISSED EID", missed_eid
    db_source.close()


def process_source_rpvs(db_source, db_prod, geocoder, entities, test_mode):
  log_prefix = "[source_rpvs] "

  # Connect to the source schema:
  source_schema_name = db_source.get_latest_schema('source_rpvs')
  db_source.execute('SET search_path="' + source_schema_name + '";')
  print("%ssource_schema_name=%s" % (log_prefix, source_schema_name))

  # Read relevant data from the source database:
  rows = db_source.query("""
      SELECT
        concat_ws(' ',
          kuv_title_front,
          kuv_first_name,
          kuv_last_name,
          kuv_title_back,
          kuv_public_figure
        ) AS kuv_name,
        concat_ws(' ',
          kuv_address,
          kuv_city,
          kuv_psc,
          kuv_country
        ) AS kuv_address,
        partner_ico
      FROM
        rpvs
      """ + (" LIMIT 1000;" if test_mode else ";")
  )
  print("%sRetrieved %d rows from table `rpvs`." % (
      log_prefix, len(rows)))

  # TODO: These should be collected by the Entities and Geocoder classes.
  # Collect statistics about matching:
  missed = 0
  found = 0
  empty = 0
  missed_eid = 0
  found_eid = 0
  missed_addresses = set([])

  # Construct set of edges between partners and beneficiaries. This
  # needs to be a set to satisfy a UNIQUE constraint on `related`.
  edges = set()
  for row in tqdm.tqdm(rows, desc=log_prefix):

    # Attempt to geocode the address:
    kuv_address = row["kuv_address"]
    kuv_address_id = geocoder.GetAddressId(kuv_address.encode("utf8"))
    if kuv_address_id is None:

      # <statistics>
      if kuv_address == "":
        empty += 1
      else:
        if test_mode and missed < 10:
          print("%sMISSING ADDRESS %s" % (
              log_prefix, kuv_address.encode("utf8")))
        missed_addresses.add(kuv_address)
        missed += 1
      # </statistics>

      continue

    # <statistics>
    found += 1;
    # </statistics>

    # Attempt to match an existing entity, or create a new one:
    kuv_name = row["kuv_name"]
    eid_kuv = entities.GetEntity(None, kuv_name, kuv_address_id)
    if eid_kuv is None:
      missed_eid += 1
      continue

    try:
      partner_ico = int(row["partner_ico"])
    except ValueError:
      continue
    eid_partner = entities.GetEidForOrgId(partner_ico)
    if eid_partner is None:
      print("%sEntity not found for partner_ico=%d" % (
          log_prefix, partner_ico))
      continue

    found_eid += 1

    edges.add((eid_partner, eid_kuv))
  print("%sCollected %d edges" % (log_prefix, len(edges)))

  # <statistics>
  print "FOUND", found
  print "MISSED", missed
  print "EMPTY", empty
  print "MISSED UNIQUE", len(missed_addresses)
  print "FOUND EID", found_eid
  print "MISSED EID", missed_eid
  # </statistics>

  # Create an edge type for `konecny uzivatel vyhod`:
  edge_type_id = graph_tools.add_or_get_edge_type(
      db_prod, u"Konečný užívateľ výhod", log_prefix)

  # Insert edges into table `related`:
  query = """
      INSERT INTO related(eid, eid_relation, stakeholder_type_id)
      VALUES (%s, %s, %s);
  """
  query_data = [(source, target, edge_type_id)
                for source, target in edges]
  with db_prod.cursor() as cur:
    cur.executemany(query, query_data)


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
    # as needed. We process them in the order!
    for key in sorted(config.keys()):
        config_per_source = config[key]
        print "Working on source:", key
        ProcessSource(db_prod, geocoder, entities_lookup, config_per_source, test_mode)
        print "GEOCODER STATS"
        geocoder.PrintStats()

    # Process yaml-free sources:
    db_source = DatabaseConnection(
        path_config='db_config_update_source.yaml')
    process_source_rpvs(db_source, db_prod, geocoder, entities_lookup, test_mode)
    db_source.close()

    # Run post processing
    post_process.do_post_processing(db_prod, test_mode)

    # Grant apps read-only access to the newly created schema and tables within
    db_prod.grant_usage_and_select_on_schema(prod_schema_name, 'data')
    db_prod.grant_usage_and_select_on_schema(prod_schema_name, 'verejne')
    db_prod.grant_usage_and_select_on_schema(prod_schema_name, 'kataster')
    db_prod.grant_usage_and_select_on_schema(prod_schema_name, 'prepojenia')
    db_prod.grant_usage_and_select_on_schema(prod_schema_name, 'obstaravania')

    # Commit database changes and close database connections
    db_address_cache.commit()
    db_address_cache.close()
    if test_mode:
        db_prod.conn.rollback()
        print('[OK] Rolled back database changes (test mode)')
    else:
        db_prod.commit()
        db_prod.close()


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--disable_test_mode', default=False, action='store_true', help='Disable test mode')
    args_dict = vars(parser.parse_args())
    main(args_dict)
