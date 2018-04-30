import argparse
import os
import sys

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../data/db')))
from db import DatabaseConnection
from status import get_latest_schema
from utils import yaml_load


""" Script to generate public data dump files from the latest production data.
    Should be invoked whenever new production data is generated.

    Configuration (dumps to create, and where to save them) is in public_dumps.yaml.
"""

def generate_public_data_dumps(limit=None, verbose=False):
    """ Generates the public data dump files from the latest production data """

    # Connect to the latest production data schema
    db = DatabaseConnection(path_config='db_config_update_source.yaml')
    schema = get_latest_schema(db, 'prod_')
    db.execute('SET search_path="' + schema + '";')
    timestamp = schema[schema.rfind('_')+1:]
    if verbose:
        print('[OK] Dumping from schema "%s"...' % (schema))
    if limit is not None:
        print('[WARNING] Dumping with row limit %d!' % (limit))

    # Read YAML configuration file
    config = yaml_load('public_dumps.yaml')
    dir_save = config['save_directory']
    dumps = config['dumps']

    # Process all dumps
    for dump_name in dumps:
        # Construct dump query
        q = dumps[dump_name]['query']
        q = q.rstrip().rstrip(';') # possibly remove ; ending
        if limit is not None:
            q += ' LIMIT %d' % (limit)

        # Dump to CSV without timestamp
        path_output = '%s%s.csv' % (dir_save, dump_name)
        db.dump_to_CSV(q, path_output)
        if verbose:
            print('[OK] Created dump "%s" in %s' % (dump_name, path_output))

        # Dump to CSV with timestamp
        path_output = '%s%s_%s.csv' % (dir_save, dump_name, timestamp)
        db.dump_to_CSV(q, path_output)
        if verbose:
            print('[OK] Created dump "%s" in %s' % (dump_name, path_output))

    # Close database connection
    db.close()


def main(args_dict):
    limit = args_dict['limit']
    verbose = args_dict['verbose']
    generate_public_data_dumps(limit=limit, verbose=verbose)

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--limit', type=int, default=None, help='Limit number of rows in each dump')
    parser.add_argument('--verbose', default=False, action='store_true', help='Report progress to stdout')
    args_dict = vars(parser.parse_args())
    main(args_dict)
