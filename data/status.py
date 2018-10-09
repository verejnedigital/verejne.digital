"""Functions reporting status of our data (source and prod).

These functions are primarily invoked by server hooks of our backend
application data.
"""

import argparse
import collections
import csv
import datetime
import os
import subprocess
import sys
import urllib

from db.db import DatabaseConnection
import utils


def _get_tables_and_columns_in_schema(db, schema):
  """Returns a dict describing all tables and columns in `schema`."""

  # Obtain names of tables in `schema`:
  q = """
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = '""" + schema + """'
      ORDER BY table_name;
      """
  rows_tables = db.query(q)

  # Obtain row counts (warning: could be inaccurate under heavy load):
  q = """
      SELECT relname, n_live_tup
      FROM pg_stat_user_tables
      WHERE schemaname = '""" + schema + """';
      """
  num_rows = {row['relname']: row['n_live_tup']
              for row in db.query(q)}

  # The above method occasionally returns zero counts for all or most
  # tables. In that case, this alternative row counting method can
  # provide more accurate information:
  q = """
      SELECT relname, reltuples
      FROM pg_class
      LEFT JOIN pg_namespace
      ON (pg_namespace.oid = pg_class.relnamespace)
      WHERE relkind='r' AND pg_namespace.nspname='""" + schema + """';
      """
  for row in db.query(q):
    relname = row['relname']
    if (relname not in num_rows) or (num_rows[relname] == 0):
      num_rows[relname] = row['reltuples']

  # Obtain foreign keys:
  q = """
      SELECT
        source_table.relname AS source_t,
        source_column.attname AS source_c,
        target_table.relname AS target_t,
        target_column.attname AS target_c
      FROM
        pg_constraint
      INNER JOIN
        pg_class source_table
        ON source_table.oid=pg_constraint.conrelid
      INNER JOIN
        pg_namespace
        ON pg_namespace.oid=pg_constraint.connamespace
      INNER JOIN
        pg_attribute source_column
        ON source_column.attrelid=pg_constraint.conrelid
      INNER JOIN
        pg_class target_table
        ON target_table.oid=pg_constraint.confrelid
      INNER JOIN
        pg_attribute target_column
        ON target_column.attrelid=pg_constraint.conrelid
      WHERE
        pg_constraint.contype='f'
        AND source_column.attnum = ANY(pg_constraint.conkey)
        AND target_column.attnum = ANY(pg_constraint.confkey)
        AND pg_namespace.nspname=%s
      ;
      """
  q_data = [schema]
  foreign_keys = collections.defaultdict(
      lambda: collections.defaultdict(list))
  foreign_keys_rows = db.query(q, q_data, return_dicts=False)
  for source_t, source_c, target_t, target_c in foreign_keys_rows:
    foreign_keys[source_t][source_c].append((target_t, target_c))

  # Obtain column names of each obtained table
  tables = []
  for row_table in rows_tables:
    table_name = row_table['table_name']
    q = """
        SELECT column_name, data_type FROM information_schema.columns
        WHERE table_schema = '""" + schema + """'
            AND table_name = '""" + table_name + """';
        """
    columns = db.query(q)

    # Save foreign key references for each column
    for column in columns:
      column_name = column['column_name']
      column['foreign_keys'] = foreign_keys[table_name][column_name]

    tables.append({
        'name': table_name,
        'num_rows': num_rows[table_name],
        'columns': columns,
    })
  return tables


def _datetimestr_from_schema(schema):
  """Returns a pretty-printed datetime from a schema name.

  Args:
    schema: A schema name of the form <schema_name>_YYmmddHHMMSS.
  Returns:
    Datetime from the end of the schema name, formatted for printing.
  """
  datetime_parsed = datetime.datetime.strptime(
      schema[schema.rfind('_')+1:], '%Y%m%d%H%M%S')
  return datetime_parsed.strftime('%Y-%m-%d %H:%M:%S')


def get_source_data_info():
  """Returns list of dicts describing our data sources."""

  # Establish connection to the database:
  db = DatabaseConnection(path_config='db_config_data.yaml')

  # Iterate through sources listed in sources.json:
  sources = utils.json_load('../data/sources.json')
  result = []
  for source in sources:
    # Obtain schema with the last update:
    try:
      schema = db.get_latest_schema('source_' + source['name'])
    except Exception as exception:
      print('[WARNING] %s' % (exception))
      continue

    # Store information to be returned:
    result.append({
        'description': source['description'],
        'name': source['name'],
        'schema': schema,
        'tables': _get_tables_and_columns_in_schema(db, schema),
        'update': _datetimestr_from_schema(schema),
    })

  # Close database connection and return the result:
  db.close()
  return result


def get_prod_data_info():
  """Returns dict describing our latest production schema."""

  db = DatabaseConnection(path_config='db_config_data.yaml')
  schema = db.get_latest_schema('prod_')
  response = {
      'schema': schema,
      'tables': _get_tables_and_columns_in_schema(db, schema),
      'update': _datetimestr_from_schema(schema),
  }
  db.close()
  return response


def get_public_dumps_info():
  """Returns list of dicts describing our public CSV dumps."""

  # Read public dumps YAML configuration file:
  config = utils.yaml_load('../data/public_dumps.yaml')
  dir_save = config['save_directory']
  dumps = config['dumps']

  # Iterate through the dumps:
  result = []
  for dump_name in dumps:
    # Find dump file with latest timestamp (inherited from prod data):
    filenames = [n for n in os.listdir(dir_save)
                 if n.startswith(dump_name + '_')
                 and n.endswith('.csv')]
    if len(filenames) == 0:
      print('[WARNING] Dump file for `%s` not found.' % (dump_name))
      continue
    filename = sorted(filenames, reverse=True)[0]

    # Append dump info to results:
    result.append({
        'name': dump_name,
        'notebook_url': dumps[dump_name]['notebook_url'],
        'query': dumps[dump_name]['query'].strip(),
        'url': 'https://verejne.digital/data/%s' % (filename)
    })
  return result
