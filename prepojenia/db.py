import psycopg2
import psycopg2.extras
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
