import psycopg2
import psycopg2.extras
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
