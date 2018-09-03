import psycopg2
import psycopg2.extras
from psycopg2.extensions import AsIs
psycopg2.extensions.register_type(psycopg2.extensions.UNICODE)
psycopg2.extensions.register_type(psycopg2.extensions.UNICODEARRAY)
import yaml

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
            print('[OK] Renamed schema "%s" to "%s"' % (schema_old, schema_new))

    def grant_select_on_schema(self, schema, user):
        q = 'GRANT SELECT ON ALL TABLES IN SCHEMA "%s" TO %s;' % (
            schema, user)
        self.execute(q)
        print('[OK] Granted SELECT on schema %s to user %s' % (
            schema, user))

    def grant_usage_and_select_on_schema(self, schema, user):
        q = 'GRANT USAGE ON SCHEMA "' + schema + '" TO ' + user + ';'
        q += 'GRANT SELECT ON ALL TABLES IN SCHEMA "' + schema + '" TO ' + user + ';'
        self.execute(q, (schema,))
        print('[OK] Granted USAGE and SELECT on schema %s to %s' % (schema, user))

    def get_latest_schema(self, prefix):
        """ Returns the name of the most recent schema whose full name starts
            with the given prefix. """
        q = """
            SELECT schema_name
            FROM information_schema.schemata
            WHERE schema_name ILIKE '""" + prefix + """_%%'
            ORDER BY schema_name DESC
            LIMIT 1;
            """
        rows = self.query(q)
        if len(rows) == 0:
            raise Exception('No schema found for prefix "%s"' % (prefix))
        return rows[0]['schema_name']

    def dump_to_CSV(self, query, path_output):
        with self.conn.cursor() as cur:
            q = query.rstrip().rstrip(';') # possibly remove ; from the end of the query
            q = 'COPY ({0}) TO STDOUT WITH CSV HEADER'.format(q)
            with open(path_output, 'w') as f:
                cur.copy_expert(q, f)
