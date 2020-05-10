"""Script to generate public data dump files from latest prod data.

This script should be invoked whenever new prod data is generated.
Configuration (dumps to create, and where to save them) is stored in
public_dumps.yaml.
"""

import os
import shutil
import sys

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../db')))
from db import DatabaseConnection

from utils import yaml_load


def main():
    """Generates public data dump files from the latest prod data."""

    # Connect to the latest schemas.
    db = DatabaseConnection(path_config='db_config.yaml')
    schema = db.get_latest_schema('prod_')
    schema_profil = db.get_latest_schema('source_internal_profil_')
    db.execute('SET search_path="' + schema + '", "' + schema_profil + '";')
    timestamp = schema[schema.rfind('_') + 1:]
    print('[OK] Dumping from schemas "%s" and "%s"...' % (schema, schema_profil))

    # Read YAML configuration file.
    config = yaml_load('public_dumps.yaml')
    dir_save = config['save_directory']
    dumps = config['dumps']

    # Process all dumps.
    for dump_name in dumps:
        save_path = os.path.join(dir_save, '%s_%s.csv' % (dump_name, timestamp))
        db.dump_to_CSV(dumps[dump_name]['query'], save_path)
        print('[OK] Saved dump "%s" to %s' % (dump_name, save_path))

        stage_path = os.path.join(dir_save, dump_name + '.csv')
        shutil.copyfile(save_path, stage_path)
        print('[OK] Copied dump "%s" to %s' % (dump_name, stage_path))

    # Close database connection.
    db.close()


if __name__ == '__main__':
    main()
