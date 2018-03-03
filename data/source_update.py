import argparse
import os
import sys
import urllib

from datetime import datetime
from subprocess import call

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../data/db')))
from db import DatabaseConnection
from utils import json_load


""" Script for updating data sources. Specify the data sources to be updated
    as command line parameters, using the data source names from sources.json.
    Example:
        python source_update.py internal_profil
"""

def update_source(source, timestamp):
    # Check that the (temporary) schema names created by this data source
    # do not conflict with existing schemas in the database
    db = DatabaseConnection(path_config='db_config_update_source.yaml')
    q = """SELECT EXISTS(SELECT 1 FROM information_schema.schemata WHERE schema_name IN %s);"""
    q_data = (tuple(source['schemas']),)
    res = db.query(q, q_data, return_dicts=False)
    db.close()
    if res[0][0]:
        raise Exception('Schema that a source reads into already exists')

    # Download online resource if a URL is specified, storing it at the
    # location specified in source['path']
    if ('url' in source):
        urllib.urlretrieve(source['url'], source['path'])

    # Load into postgres, unzipping along the way
    if source['path'].endswith('.gz'):
        call(['pg_restore', '-d', 'vd', source['path']])
    # Load into postgres directly
    else:
        # The options -q -o /dev/null just suppress output
        call(['psql', '-d', 'vd', '-f', source['path'], '-q', '-o', '/dev/null'])

    # Rename loaded schema(s) to the desired schema name(s)
    # If there is a single schema, rename it to source_NAME_TIMESTAMP
    # If there are multiple schemas, rename them to source_NAME_SCHEMA_TIMESTAMP
    db = DatabaseConnection(path_config='db_config_update_source.yaml')
    if len(source['schemas']) == 1:
        schema_old = source['schemas'][0]
        schema_new = 'source_' + source['name'] + '_' + timestamp
        db.rename_schema(schema_old, schema_new)
    else:
        for schema_old in source['schemas']:
            schema_new = 'source_' + source['name'] + '_' + schema_old + '_' + timestamp
            db.rename_schema(schema_old, schema_new)
    db.commit()
    db.close()


def main(args_dict):
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    sources = json_load('sources.json')
    sources_todo = args_dict['sources_todo']

    # Iterate through requested data sources, checking they are all recognised
    sources_by_name = {source['name']: source for source in sources}
    for source_todo in sources_todo:
        if source_todo not in sources_by_name:
            raise Exception('Source "%s" not known' % (source_todo))
        source = sources_by_name[source_todo]
        update_source(source, timestamp)


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('sources_todo', nargs='*', help='names of sources to update', action='store')
    args_dict = vars(parser.parse_args())
    try:
        main(args_dict)
    except:
        import pdb, sys, traceback
        type, value, tb = sys.exc_info()
        traceback.print_exc()
        pdb.post_mortem(tb)
        raise
