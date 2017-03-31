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
            address     text,
            office_id   int     REFERENCES offices(id),
            term_start  int,
            term_end    int
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

    politicians_columns = ['firstname', 'surname', 'address', 'office_id', 'term_start', 'term_end']
    q_insert_politician = """
        INSERT  INTO politicians(""" + ', '.join(politicians_columns) + """)
        VALUES  (%s, %s, %s, %s, %s, %s)
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
    q = """
        SELECT  id FROM offices
        WHERE   name_male='poslanec NR SR';
        """
    with db.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
        cur.execute(q)
        row = cur.fetchone()
    poslanec_NR_SR_id = row['id']

    # Load JSON file into database
    path_poslanci = DIR_DATA + 'data/poslanci_NRSR_2016_2020.json'
    politicians = json_load(path_poslanci)
    for politician in politicians:
        for address in politician['addresses']:
            q_data = (politician['firstname'], politician['surname'], address, poslanec_NR_SR_id, 2016, 2020)
            with db.cursor() as cur:
                cur.execute(q_insert_politician, q_data)
    print('\r%sINSERTED%s %s politicians' % (color.GREEN, color.END, len(politicians)))

    # Commit changes and close connection to database
    db.commit()
    db.close()


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    args_dict = vars(parser.parse_args())
    main(args_dict)
