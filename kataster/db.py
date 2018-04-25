import psycopg2
import psycopg2.extras
from psycopg2.extensions import AsIs
psycopg2.extensions.register_type(psycopg2.extensions.UNICODE)
psycopg2.extensions.register_type(psycopg2.extensions.UNICODEARRAY)
import yaml


def db_connect(path_config='db_config.yaml'):
    with open(path_config, 'r') as stream:
        config = yaml.load(stream)
    return psycopg2.connect(user=config['user'], dbname=config['db'])

def db_execute(db, query, query_data=()):
    """ Executes query on database db. Does not return any data. """
    with db.cursor() as cur:
        cur.execute(query, query_data)

def db_query(db, query, query_data=()):
    """ Executes query on database db. Returns all read rows as
        a list of dictionaries. """
    with db.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
        cur.execute(query, query_data)
        rows = cur.fetchall()
    return rows

def db_insert_jsons(db, table_name, json_list, keys, ignore_conflict=False, returning=None):
    """ Given a list of dictionaries, inserts the specified keys from each dictionary
        into the table table_name of the provided database db.
        Optionally ignores conflicts and/or returns the requested column names from the
        inserted rows.
    """
    q_pattern = '(' + ', '.join(["""%s""" for _ in keys]) + ')'
    q_patterns = ', '.join([q_pattern for _ in json_list])
    q_conflict = ' ON CONFLICT DO NOTHING' if ignore_conflict else ''
    q_return = '' if (returning is None) else (' RETURNING ' + ','.join(returning))
    q = """
        INSERT  INTO """ + table_name + """(""" + ', '.join(keys) + """)
        VALUES  """ + q_patterns + """
        """ + q_conflict + """
        """ + q_return + """;"""
    q_data = tuple((j[key] for j in json_list for key in keys))

    # Return values (only if requested)
    if returning is None:
        db_execute(db, q, q_data)
    else:
        return db_query(db, q, q_data)

class DatabaseConnection():
    def __init__(self, path_config='db_config.yaml', search_path=None):
        with open(path_config, 'r') as stream:
            config = yaml.load(stream)
        self.conn = psycopg2.connect(user=config['user'], dbname=config['db'])
        if search_path is not None:
            self.execute('SET search_path = %s', (search_path,))

    def execute(self, query, query_data=()):
        """ Executes query without returning any data """
        with self.conn.cursor() as cur:
            cur.execute(query, query_data)

    def execute_values(self, query, query_data):
        with self.conn.cursor() as cur:
            psycopg2.extras.execute_values(cur, query, query_data)

    def query(self, query, query_data=(), return_dicts=True):
        """ Executes query and returns all rows as a list of dicts """
        cursor_factory = psycopg2.extras.RealDictCursor if return_dicts else None
        with self.conn.cursor(cursor_factory=cursor_factory) as cur:
            cur.execute(query, query_data)
            rows = cur.fetchall()
        return rows

    def get_server_side_cursor(self, query, query_data=(), buffer_size=100000):
        """ Executes query and returns all rows using a server side cursor """
        cur = self.conn.cursor('dummy_cursor_name')
        cur.itersize = buffer_size
        cur.execute(query, query_data)
        return cur

    def cursor(self):
        return self.conn.cursor()

    def dict_cursor(self):
        return self.conn.cursor(cursor_factory=psycopg2.extras.DictCursor)

    def commit(self):
        self.conn.commit()

    def close(self):
        self.conn.close()


    def add_values(self, table, values):
        with self.conn.cursor() as cur:
            command = (
                    "INSERT INTO %s VALUES (DEFAULT," +
                    (",".join(["%s"] * len(values))) +
                    ") RETURNING id"
            )
            cur.execute(command, [AsIs(table)] + values)
            return cur.fetchone()[0]

    # --- HELPER METHODS ---
    def rename_schema(self, schema_old, schema_new, verbose=True):
        q = "ALTER SCHEMA %s RENAME TO %s;" % (
            psycopg2.extensions.quote_ident(schema_old, self.conn),
            psycopg2.extensions.quote_ident(schema_new, self.conn))
        self.execute(q)
        if verbose:
            print('Renamed schema "%s" to "%s"' % (schema_old, schema_new))

    def grant_usage_and_select_on_schema(self, schema, user):
        q = 'GRANT USAGE ON SCHEMA "' + schema + '" TO ' + user + ';'
        q += 'GRANT SELECT ON ALL TABLES IN SCHEMA "' + schema + '" TO ' + user + ';'
        self.execute(q, (schema,))
        print('[OK] Granted USAGE and SELECT on schema %s to %s' % (schema, user))
