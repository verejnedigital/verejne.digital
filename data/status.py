import argparse
import csv
import os
import subprocess
import sys
import urllib

from datetime import datetime

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../data/db')))
from db import DatabaseConnection
from utils import json_load


""" Functions reporting current status of our data (source and production).
"""

def get_source_data_info():
    """ Returns a list of data sources, together with information about
        the latest update (timestamp, list of table names and columns) """

    # Establish connection to the database
    db = DatabaseConnection(path_config='../data/db_config_update_source.yaml')

    # Iterate through sources listed in sources.json
    sources = json_load('../data/sources.json')
    result = []
    for source in sources:
        # Obtain schema with the last update
        schema = get_latest_schema(db, source['name'])
        update = schema[schema.rfind('_')+1:]
        update = datetime.strptime(update, '%Y%m%d%H%M%S').strftime('%Y-%m-%d %H:%M:%S')

        # Obtain table names in the latest schema
        q = """
            SELECT table_name FROM information_schema.tables
            WHERE table_schema = '""" + schema + """'
            """
        rows = db.query(q)
        table_names = [row['table_name'] for row in rows]

        # Store information to be returned
        result.append({
            'description': source['description'] if 'description' in source else 'N/A',
            'name': source['name'],
            'table_names': table_names,
            'update': update,
        })
    return result


def get_latest_schema(db, source_name):
    """ Returns the name of the most recent source schema for the data source
        with the given name"""
    q = """
        SELECT schema_name
        FROM information_schema.schemata
        WHERE schema_name ILIKE 'source_""" + source_name + """_%%'
        ORDER BY schema_name DESC
        LIMIT 1;
        """
    rows = db.query(q)
    if len(rows) == 0:
        raise Exception('No schema found for source name "%s"' % (source_name))
    return rows[0]['schema_name']


def print_source_tables():
    pass
