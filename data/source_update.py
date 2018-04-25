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


""" Script for updating data sources. Specify the data sources to be updated
    as command line parameters, using the data source names from sources.json.
    Example:
        python source_update.py ekosystem_ITMS --verbose
"""

def update_SQL_source(source, timestamp, dry_run, verbose):
    # Check that the (temporary) schema names created by this data source
    # do not conflict with existing schemas in the database
    db = DatabaseConnection(path_config='db_config_update_source.yaml')
    q = """SELECT schema_name FROM information_schema.schemata WHERE schema_name IN %s LIMIT 1;"""
    q_data = (tuple(source['schemas']),)
    res = db.query(q, q_data, return_dicts=False)
    db.close()
    if len(res) >= 1:
        raise Exception('Schema "%s" that source "%s" reads into already exists' % (res[0][0], source['name']))
    if verbose:
        print('[OK] No conflicting schema names found')

    # Download online resource if a URL is specified, storing it at the
    # location specified in source['path']
    if ('url' in source):
        urllib.urlretrieve(source['url'], source['path'])
        if verbose:
            print('[OK] Downloaded from %s to %s' % (source['url'], source['path']))

    if dry_run:
        print('[WARNING] --dry_run option not implemented for entire pipeline of updating an SQL source')
        db.close()
        return

    # Load into postgres, unzipping along the way
    if source['path'].endswith('.sql.gz'):
        p1 = subprocess.Popen(['gunzip', '-c', source['path']], stdout=subprocess.PIPE)
        subprocess.check_output(['psql', '-d', 'vd', '-q'], stdin=p1.stdout)
    # Load into postgres directly
    else:
        # The options -q -o /dev/null just suppress output
        subprocess.call(['psql', '-d', 'vd', '-f', source['path'], '-q', '-o', '/dev/null'])

    # Rename loaded schema(s) to the desired schema name(s)
    # If there is a single schema, rename it to source_NAME_TIMESTAMP
    # If there are multiple schemas, rename them to source_NAME_SCHEMA_TIMESTAMP
    db = DatabaseConnection(path_config='db_config_update_source.yaml')
    if len(source['schemas']) == 1:
        schema_old = source['schemas'][0]
        schema_new = 'source_' + source['name'] + '_' + timestamp
        db.rename_schema(schema_old, schema_new, verbose)
        # TEMP
        # For SourceDataInfo under kataster to work properly, user kataster
        # needs to be able to see the newly created schema and tables within
        db.grant_usage_and_select_on_schema(schema_new, 'kataster')
    else:
        for schema_old in source['schemas']:
            schema_new = 'source_' + source['name'] + '_' + schema_old + '_' + timestamp
            db.rename_schema(schema_old, schema_new, verbose)
            # TEMP
            # For SourceDataInfo under kataster to work properly, user kataster
            # needs to be able to see the newly created schema and tables within
            db.grant_usage_and_select_on_schema(schema_new, 'kataster')

    # Commit and close database connection
    db.commit()
    db.close()


def update_CSV_source(source, timestamp, dry_run, verbose):
    # Load the CSV file
    with open(source['path'], 'r') as f:
        delimiter = str(source['delimiter']) # requires string, not unicode
        reader = csv.reader(f, delimiter=delimiter)

        # Extract column names from header line and then the actual data
        header = next(reader)
        column_names = [column_name.decode('utf-8') for column_name in header]
        data = [tuple(row) for row in reader]
    if verbose:
        print('Loaded CSV file with %d columns and %d data rows' % (len(column_names), len(data)))

    # Create postgres schema
    db = DatabaseConnection(path_config='db_config_update_source.yaml')
    schema = 'source_' + source['name'] + '_' + timestamp
    q = 'CREATE SCHEMA %s; SET search_path="%s";' % (schema, schema)
    db.execute(q)

    # Create table containing the column names from CSV file
    q = 'CREATE TABLE column_names (index int, name text);'
    db.execute(q)
    q = """INSERT INTO column_names VALUES %s;"""
    q_data = [(i, column_name) for i, column_name in enumerate(column_names)]
    db.execute_values(q, q_data)

    # Create table containing the actual data from the CSV file
    table = source['table_name']
    table_columns = ', '.join(['col%d text' % i for i in range(len(column_names))])
    q = 'CREATE TABLE %s (%s);' % (table, table_columns)
    db.execute(q)

    # Populate the table with data
    q = 'INSERT INTO ' + table + ' VALUES %s;'
    db.execute_values(q, data)
    if verbose:
        print('Inserted %d rows into %s.%s%s' % (len(data), schema, table, ' (dry run)' if dry_run else ''))

    # Commit and close database connection
    if not dry_run:
        db.commit()
    db.close()


def main(args_dict):
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    sources = json_load('sources.json')
    sources_todo = args_dict['sources_todo']
    dry_run = args_dict['dry_run']
    verbose = args_dict['verbose']

    # Iterate through requested data sources, checking they are all recognised
    sources_by_name = {source['name']: source for source in sources}
    for source_todo in sources_todo:
        if source_todo not in sources_by_name:
            raise Exception('Source "%s" not known' % (source_todo))
        source = sources_by_name[source_todo]
        if source['type'] == 'SQL':
            update_SQL_source(source, timestamp, dry_run, verbose)
        elif source['type'] == 'CSV':
            update_CSV_source(source, timestamp, dry_run, verbose)


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('sources_todo', nargs='*', help='names of sources to update', action='store')
    parser.add_argument('--dry_run', default=False, action='store_true', help='Do not commit database changes')
    parser.add_argument('--verbose', default=False, action='store_true', help='Report progress to stdout')
    args_dict = vars(parser.parse_args())
    try:
        main(args_dict)
    except:
        import pdb, sys, traceback
        type, value, tb = sys.exc_info()
        traceback.print_exc()
        pdb.post_mortem(tb)
        raise
