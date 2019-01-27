# -*- coding: utf-8 -*-
import argparse
from datetime import datetime
import HTMLParser
import os
from psycopg2.extensions import AsIs
import re
import sys
import xml.etree.ElementTree as ET

from db.db import DatabaseConnection
import geocoder as geocoder_lib
import entities
from prod_generation import graph_tools
import post_process
import utils


def ExtractDescriptionFromBody(body):
    """ Input is the raw body of raw_notice.
    This method extracts description from it and returns it.
    """
    if body is None: return None
    root = ET.fromstring(body)
    if root is None: return None
    # TODO: port to XPath
    mapping = {
        "description": ["opisPredmetuObstaravania", "opisZakazky"],
        "deadline": ["lehotaPredkladanie"]
    }
    result = {}
    email = root.find(".//InternetAddresses/Address")
    if email is not None: result["email"] = email.text
    for e in root.iter():
        component = e.attrib.get("FormComponentId", None)
        if component is None: continue
        value = e.attrib.get("Value", None)
        if value is None: continue
        for key in mapping:
            if component in mapping[key]:
                result[key] = value.replace("\n", " ")
    if len(result) == 0: return None
    return result


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
        cur.execute("SET search_path = %s,public", [AsIs(prod_schema_name)])
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
        """)


# TODO(rasto): refactor this method: split it into individual parts, so that
# the main ProcessSource is short without deep nesting
def ProcessSource(db_source, db_prod, geocoder, entities, config, test_mode):
    """ Process one source table (read from db_source) using the config and
    performing normalization using the given geocoder and entities lookup.

    The produced data are written into db_prod connection. The function writes
    new entities and addresses in to the Entities and Address tables. It also
    creates and populates supplementary tables as specified by a config.

    Throughout, "org_id" refers to "organization_id" from source RPO.
    """

    # Connect to the most recent schema from the current source
    source_schema_name = db_source.get_latest_schema('source_' + config["source_schema"])
    if "VVO" in source_schema_name:
        source_schema_name = "source_ekosystem_VVO_20181212220436"
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

    # Initialise statistics to collect.
    missed = 0
    found = 0
    empty = 0
    missed_eid = 0
    found_eid = 0
    missed_addresses = set()

    # Read data using the command given in the yaml config.
    suffix_for_testing = " LIMIT 1000" if test_mode else ""
    print("Executing SQL command...")
    query = config["command"] + suffix_for_testing
    with db_source.get_server_side_cursor(
        query, buffer_size=100000, return_dicts=True) as cur:
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
                no_new_entity = ('no_new_entity' in row) and row['no_new_entity']
                eid = entities.GetEntity(row["ico"], name, addressId,
                                         no_new_entity=no_new_entity)

            if found % 20000 == 0:
                print "Progress:", found
                sys.stdout.flush()

            # Save the mapping from RPO `organization_id` identifiers
            # to our `eid` identifiers. This flag is only turned on
            # for the first source `1_rpo`.
            if config.get("save_org_id"):
                entities.AddOrg2Eid(row["org_id"], eid)

            # This flag indicates that column `eid_relation` contains
            # an `organization_id` (id from source RPO) rather than an
            # eid. The value must thus first be mapped to eid. This
            # flag is only turned on for the source `2_related`.
            if config.get("use_org_id_as_eid_relation"):
                eid2 = entities.GetEidForOrgId(row["eid_relation"])
                if eid2 is None:
                  continue
                row["eid_relation"] = eid2

            if config.get("extract_description_from_body"):
                extract = ExtractDescriptionFromBody(row["body"])
                if extract is not None:
                    row["body"] = extract.get("description", None)
                    if "deadline" in extract:
                        row["deadline"] = datetime.strptime(res["deadline"], "%Y-%m-%dT%H:%M:%S").date()
                    if "email" in extract:
                        row["contact_email"] = extract["email"]
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

    # Print statistics.
    print "FOUND", found
    print "MISSED", missed
    print "EMPTY", empty
    print "MISSED UNIQUE", len(missed_addresses)
    print "FOUND EID", found_eid
    print "MISSED EID", missed_eid

    # Special case: As source_internal_profil and prod tables need to
    # be kept consistent for table `profilmapping` to be meaningful,
    # only make the source schema visible to user `kataster` here.
    if config["source_schema"] == "internal_profil":
      db_prod.grant_usage_and_select_on_schema(
          source_schema_name, 'kataster')


def process_source_rpvs(db_source, db_prod, geocoder, entities, test_mode):
  log_prefix = "[source_rpvs] "

  # Set search path to latest source_rpvs schema:
  source_schema_name = db_source.get_latest_schema('source_rpvs')
  db_source.execute('SET search_path="' + source_schema_name + '";')
  print("%ssource_schema_name=%s" % (log_prefix, source_schema_name))

  # Read relevant data from the source database:
  rows = db_source.query(r"""
      SELECT
        concat_ws(' ',
          kuv_title_front,
          kuv_first_name,
          kuv_last_name,
          kuv_title_back
        ) AS kuv_name,
        concat_ws(' ',
          --Fix missing space between street name and number.
          regexp_replace(
            kuv_address, '([^/ -\.0-9])([0-9])', '\1 \2', 'gi'),
          kuv_city,
          kuv_psc,
          kuv_country
        ) AS kuv_address,
        partner_ico
      FROM
        rpvs
      """ + (" LIMIT 1000;" if test_mode else ";")
  )
  print("%sFound %d rows in table `rpvs`." % (log_prefix, len(rows)))

  # Construct set of edges between partners and beneficiaries. This
  # needs to be a set to satisfy a UNIQUE constraint on `related`.
  edges = set()
  for row in rows:

    # Geocode beneficiary's address:
    kuv_address = row["kuv_address"]
    kuv_address_id = geocoder.GetAddressId(kuv_address.encode("utf8"))
    if kuv_address_id is None:
      continue

    # Match or create an entity for the beneficiary:
    kuv_name = row["kuv_name"]
    eid_kuv = entities.GetEntity(None, kuv_name, kuv_address_id)
    if eid_kuv is None:
      continue

    # Match entity for the partner:
    try:
      partner_ico = int(row["partner_ico"])
    except ValueError:
      continue
    eid_partner = entities.ExistsICO(partner_ico)
    if eid_partner < 0:
      continue

    # Save the edge:
    edges.add((eid_kuv, eid_partner))
  print("%sCollected %d edges" % (log_prefix, len(edges)))

  # Create an edge type for `konecny uzivatel vyhod`:
  edge_type_id = graph_tools.add_or_get_edge_type(
      db_prod, u"Konečný užívateľ výhod", log_prefix)

  # Insert edges into table `related`:
  with db_prod.cursor() as cur:
    cur.executemany("""
      INSERT INTO related(eid, eid_relation, stakeholder_type_id)
      VALUES (%s, %s, %s);
      """, [(source, target, edge_type_id) for source, target in edges]
    )


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
    db_source = DatabaseConnection(
        path_config='db_config_update_source.yaml')
    db_address_cache = DatabaseConnection(
        path_config='db_config_update_source.yaml',
        search_path='address_cache')
    db_prod = DatabaseConnection(
        path_config='db_config_update_source.yaml')
    CreateAndSetProdSchema(db_prod, prod_schema_name)

    # Initialize geocoder
    geocoder = geocoder_lib.Geocoder(db_address_cache, db_prod, test_mode)
    # Initialize entity lookup
    entities_lookup = entities.Entities(db_prod)

    # Table prod_tables.yaml defines a specifications of SQL selects to read
    # source data and describtion of additional tables to be created.
    config = utils.yaml_load('prod_tables.yaml')
    # This is where all the population happens!!!
    # Go through all the specified data sources and process them, adding data
    # as needed. We process them in lexicographic order!
    for key in sorted(config.keys()):
        config_per_source = config[key]
        print "Working on source:", key
        ProcessSource(db_source, db_prod, geocoder, entities_lookup, config_per_source, test_mode)
        geocoder.PrintStats()
        entities_lookup.print_statistics()

    # Process yaml-free sources:
    process_source_rpvs(db_source, db_prod, geocoder, entities_lookup, test_mode)
    db_source.close()

    # Run post processing.
    # TODO: For now post processing requires access to the profil
    # source schema. Remove this when fixed.
    schema_profil = db_prod.get_latest_schema('source_internal_profil_')
    db_prod.execute(
        'SET search_path="' + prod_schema_name + '", "' + schema_profil + '", public;')
    post_process.do_post_processing(db_prod, test_mode)

    # Create materialized view for entity search after all entities
    # have been created.
    db_prod.execute("""
        CREATE MATERIALIZED VIEW entities_search AS
          SELECT
            id,
            to_tsvector('simple', unaccent(name)) as search_vector
          FROM entities;
          CREATE INDEX ON entities_search(search_vector);
          CREATE INDEX ON entities_search USING gin(search_vector);
    """)

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
