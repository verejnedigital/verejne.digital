"""Script to generate public data dump files from latest prod data.

This script should be invoked whenever new prod data is generated.
Configuration (dumps to create, and where to save them) is stored in
public_dumps.yaml.
"""

import os
import sys

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../db')))
from db import DatabaseConnection

from utils import yaml_load


def main():
  """Generates public data dump files from the latest prod data."""

  # Connect to the latest production data schema:
  db = DatabaseConnection(path_config='db_config.yaml')
  schema = db.get_latest_schema('prod_')
  db.execute('SET search_path="' + schema + '";')
  timestamp = schema[schema.rfind('_')+1:]
  print('[OK] Dumping from schema "%s"...' % (schema))

  # Read YAML configuration file:
  config = yaml_load('public_dumps.yaml')
  dir_save = config['save_directory']
  dumps = config['dumps']

  # Process all dumps:
  for dump_name in dumps:
    save_paths = [
        os.path.join(dir_save, dump_name + '.csv'),
        os.path.join(dir_save, '%s_%s.csv' % (dump_name, timestamp))
    ]
    for save_path in save_paths:
      db.dump_to_CSV(dumps[dump_name]['query'], save_path)
      print('[OK] Saved dump "%s" to %s' % (dump_name, save_path))

  # Close database connection:
  db.close()


if __name__ == '__main__':
  main()
