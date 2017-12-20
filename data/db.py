import psycopg2

def db_connect(db_name, db_user):
    return psycopg2.connect(user=db_user, dbname=db_name)

def db_execute(db, query, query_data=()):
    """ Executes query on database db. Does not return any data. """
    with db.cursor() as cur:
        cur.execute(query, query_data)

def db_insert_json(db, table, j, keys=None):
    if keys is None:
        keys = j.keys()
    q = """
        INSERT  INTO """ + table + """(""" + ', '.join(keys) + """)
        VALUES  (""" + ', '.join(["""%s""" for _ in keys]) + """)
        ON CONFLICT DO NOTHING;
        """
    q_data = tuple((j[key] for key in keys))
    db_execute(db, q, q_data)
