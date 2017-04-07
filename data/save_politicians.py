import argparse
import os
import psycopg2
import psycopg2.extras
psycopg2.extensions.register_type(psycopg2.extensions.UNICODE)
psycopg2.extensions.register_type(psycopg2.extensions.UNICODEARRAY)

from db import db_connect
from utils import json_load, color, print_progress


#DIR_DATA = os.path.expanduser('~') + '/Dropbox/Projects/nineveh/'
DIR_DATA = '/home/matej_balog/'


""" Creates table offices (if does not exist yet) and table politicians
    (if does not exist yet) and fills them with data from raw JSON files.
    """

def get_office_id(db, office_name_male):
    q = """
        SELECT  id FROM offices
        WHERE   name_male='%s';
        """ % (office_name_male)
    with db.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
        cur.execute(q)
        row = cur.fetchone()
    return row['id']


def main(args_dict):
    # Start connection, everything will be a single transaction
    db = db_connect()

    # Set up tables offices and Subjects if not exist already
    q = """
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'division_level') THEN
                CREATE TYPE division_level
                AS ENUM ('country', 'region', 'district', 'municipality', 'borough');
            END IF;
        END
        $$;
        """

    q += """
        DROP TABLE politicians;
        DROP TABLE offices;

        CREATE TABLE IF NOT EXISTS offices(
            id              serial          PRIMARY KEY,
            name_male       text            UNIQUE,
            name_female     text            UNIQUE,
            level           division_level
        );

        CREATE TABLE IF NOT EXISTS politicians(
            id          serial  PRIMARY KEY,
            firstname   text,
            surname     text,
            title       text,
            address     text,
            email       text,
            office_id   int     REFERENCES offices(id),
            term_start  int,
            term_end    int,
            party_nom   text,
            party       text,
            source      text,
            picture     text
        );
        """
    with db.cursor() as cur:
        cur.execute(q)

    # Construct insertion queries
    offices_columns = ['name_male', 'name_female', 'level']
    q_insert_office = """
        INSERT  INTO offices(""" + ', '.join(offices_columns) + """)
        VALUES  (%s, %s, %s)
        ON      CONFLICT DO NOTHING;
        """

    politicians_columns = ['firstname', 'surname', 'title', 'address', 'email',
    'office_id', 'term_start', 'term_end', 'party_nom', 'party', 'source', 'picture']
    q_insert_politician = """
        INSERT  INTO politicians(""" + ', '.join(politicians_columns) + """)
        VALUES  (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        ON      CONFLICT DO NOTHING;
        """

    # Insert offices
    path_offices = DIR_DATA + 'data_raw/offices.json'
    offices = json_load(path_offices)
    for office in offices:
        q_data = tuple((office[c] for c in offices_columns))
        with db.cursor() as cur:
            cur.execute(q_insert_office, q_data)
    print('\r%sINSERTED%s %s offices' % (color.GREEN, color.END, len(offices)))

    # Get office id for poslanec NR SR
    office_name_male = u'poslanec NR SR'
    poslanec_NR_SR_id = get_office_id(db, office_name_male)
    
    # Load JSON file into database
    terms = {
        1: (1994, 1998),
        2: (1998, 2002),
        3: (2002, 2006),
        4: (2006, 2010),
        5: (2010, 2012),
        6: (2012, 2016),
        7: (2016, 2020),
    }
    path_poslanci = DIR_DATA + 'data/poslanci_NRSR.json'
    politicians = json_load(path_poslanci)
    for politician in politicians:
        for address in politician['addresses']:
            q_data = (
                politician['firstname'],
                politician['surname'],
                politician['title'],
                address,
                politician['email'],
                poslanec_NR_SR_id,
                terms[politician['CisObdobia']][0],
                terms[politician['CisObdobia']][1],
                politician['party_nom'],
                '\N',
                politician['source'],
                politician['picture']
                )
            with db.cursor() as cur:
                cur.execute(q_insert_politician, q_data)
    print('\r%sINSERTED%s %s politicians (poslanci NR SR)' % (color.GREEN, color.END, len(politicians)))

    # Get office id for poslanec MsZ Bratislava
    office_name_male = u'poslanec Mestsk\xe9ho zastupite\u013estva Bratislava'
    poslanec_MsZ_Bratislava_id = get_office_id(db, office_name_male)
    
    # Insert poslanci MsZ Bratislava
    path_poslanci = DIR_DATA + 'data/poslanci_Bratislava.json'
    politicians = json_load(path_poslanci)
    num_inserted = 0
    for politician in politicians:
        address = politician['address']
        if not address.strip():
            continue
        q_data = (
            politician['firstname'],
            politician['surname'],
            politician['title'],
            politician['address'],
            politician['email'],
            poslanec_MsZ_Bratislava_id,
            politician['term_start'],
            politician['term_end'],
            politician['party_nom'],
            politician['party'],
            politician['source'],
            politician['picture']
            )
        with db.cursor() as cur:
            cur.execute(q_insert_politician, q_data)
        num_inserted += 1
    print('\r%sINSERTED%s %s politicians (poslanci MsZ Bratislava) out of %d' % (color.GREEN, color.END, num_inserted, len(politicians)))


    # Commit changes and close connection to database
    db.commit()
    db.close()


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    args_dict = vars(parser.parse_args())
    main(args_dict)
