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
