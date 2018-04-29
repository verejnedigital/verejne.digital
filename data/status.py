import argparse
import csv
import os
import subprocess
import sys
import urllib

from datetime import datetime

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../data/db')))
from db import DatabaseConnection
from utils import json_load, yaml_load


""" Functions reporting current status of our data (source and production).
"""


def _get_tables_and_columns_in_schema(db, schema):
    # Obtain table names in the latest schema
    q = """
        SELECT table_name FROM information_schema.tables
        WHERE table_schema = '""" + schema + """';
        """
    rows_tables = db.query(q)

    # Obtain row counts (warning: could be inaccurate under heavy load)
    q = """
        SELECT relname, n_live_tup
        FROM pg_stat_user_tables
        WHERE schemaname = '""" + schema + """';
        """
    num_rows = {row['relname']: row['n_live_tup'] for row in db.query(q)}

    # Obtain column names of each obtained table
    tables = []
    for row_table in rows_tables:
        table_name = row_table['table_name']
        q = """
            SELECT column_name FROM information_schema.columns
            WHERE table_schema = '""" + schema + """'
                AND table_name = '""" + table_name + """';
            """
        rows_columns = db.query(q)
        columns = [row['column_name'] for row in rows_columns]
        tables.append({
            'name': table_name,
            'num_rows': num_rows[table_name],
            'columns': columns,
            })
    return tables

def _datetimestr_from_schema(schema):
    s = schema[schema.rfind('_')+1:]
    s = datetime.strptime(s, '%Y%m%d%H%M%S').strftime('%Y-%m-%d %H:%M:%S')
    return s


def get_source_data_info():
    """ Returns a list of data sources, together with information about
        the latest update (timestamp, list of table names and columns) """

    # Establish connection to the database
    db = DatabaseConnection(path_config='db_config_status.yaml')

    # Iterate through sources listed in sources.json
    sources = json_load('../data/sources.json')
    result = []
    for source in sources:
        # Obtain schema with the last update
        try:
            schema = get_latest_schema(db, 'source_' + source['name'])
        except Exception as exception:
            print('[WARNING] %s' % (exception))
            continue

        # Store information to be returned
        result.append({
            'description': source['description'],
            'name': source['name'],
            'tables': _get_tables_and_columns_in_schema(db, schema),
            'update': _datetimestr_from_schema(schema),
        })

    # Close database connection and return the result
    db.close()
    return result


def get_prod_data_info():
    """ Return list of tables and column names from the current production tables,
        and the time when these were generated. """
    db = DatabaseConnection(path_config='db_config_status.yaml')
    schema = get_latest_schema(db, 'prod_')
    response = {
        'tables': _get_tables_and_columns_in_schema(db, schema),
        'update': _datetimestr_from_schema(schema),
    }
    db.close()
    return response


def get_public_dumps_info():
    # Read public dumps YAML configuration file
    config = yaml_load('../data/public_dumps.yaml')
    dir_save = config['save_directory']
    dumps = config['dumps']

    # Iterate through the dumps
    result = []
    for dump_name in dumps:
        # Find dump file with the latest timestamp (inherited from prod data)
        filenames = [n for n in os.listdir(dir_save)
                        if n.startswith(dump_name + '_') and n.endswith('.csv')]
        if len(filenames) == 0:
            print('[WARNING] Could not find dump file for dump "%s"' % (dump_name))
            continue
        filename = sorted(filenames, reverse=True)[0]

        # Append dump info to results
        result.append({
            'name': dump_name,
            'notebook_url': dumps[dump_name]['notebook_url'],
            'query': dumps[dump_name]['query'].strip(),
            'url': 'https://verejne.digital/data/%s' % (filename)
            })
    return result


def get_latest_schema(db, prefix):
    """ Returns the name of the most recent schema whose full name starts
        with the given prefix. """
    q = """
        SELECT schema_name
        FROM information_schema.schemata
        WHERE schema_name ILIKE '""" + prefix + """_%%'
        ORDER BY schema_name DESC
        LIMIT 1;
        """
    rows = db.query(q)
    if len(rows) == 0:
        raise Exception('No schema found for prefix "%s"' % (prefix))
    return rows[0]['schema_name']
