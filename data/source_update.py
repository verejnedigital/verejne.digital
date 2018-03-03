import argparse
import os
import sys
import urllib

from datetime import datetime
from subprocess import call

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../data/db')))
from db import DatabaseConnection
from utils import json_load


def update_source(source):
    # Check schema names do not conflict
    db = DatabaseConnection(path_config='db_config_update_source.yaml')
    q = """SELECT EXISTS(SELECT 1 FROM information_schema.schemata WHERE schema_name IN %s);"""
    q_data = (tuple(source['schemas']),)
    res = db.query(q, q_data, return_dicts=False)
    db.close()
    if res[0][0]:
        raise Exception('Schema that a source reads into already exists')

    # Download online resource if a URL is specified
    if ('url' in source):
        urllib.urlretrieve(source['url'], source['path'])

    # Load into postgres, unzipping along the way
    if source['path'].endswith('.gz'):
        # TODO
        pass
    # Load into postgres directly
    else:
        call(['psql', '-d', 'vd', '-f', source['path']])


def main(args_dict):
    timestamp = datetime.now().strftime('%Y-%m-%d_%H-%M-%S')
    sources = json_load('sources.json')
    sources_todo = args_dict['sources_todo']

    sources_by_name = {source['name']: source for source in sources}
    for source_todo in sources_todo:
        if source_todo not in sources_by_name:
            raise Exception('Source "%s" not known' % (source_todo))
        source = sources_by_name[source_todo]
        update_source(source)


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
