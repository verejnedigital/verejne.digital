import argparse
import psycopg2
import psycopg2.extras
psycopg2.extensions.register_type(psycopg2.extensions.UNICODE)
psycopg2.extensions.register_type(psycopg2.extensions.UNICODEARRAY)

from datetime import datetime
from itertools import groupby

from db import db_execute, db_query, db_insert_jsons
from utils import json_load, hash_timestamp


DIR_DATA = '/home/matej_balog/data/'


""" Creates tables in the database kataster, for holding information
    about politicians. Fills the tables with data from JSON files.
    """

def main(args_dict):
    # Connect to the database
    db = psycopg2.connect(user='matej_balog', dbname='kataster')

    # Set up enum type division_level, table parties, table offices, table terms
    q = """
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'division_level') THEN
                CREATE TYPE kataster.division_level
                AS ENUM ('country', 'region', 'district', 'municipality', 'borough');
            END IF;
        END
        $$;
        """

    q += """
        DROP TABLE kataster.politicianterms;
        DROP TABLE kataster.politicians;
        DROP TABLE kataster.parties;
        DROP TABLE kataster.terms;
        DROP TABLE kataster.offices;
        """

    q += """
        CREATE TABLE IF NOT EXISTS kataster.offices(
            id              int             PRIMARY KEY,
            name_male       text            UNIQUE,
            name_female     text            UNIQUE,
            level           kataster.division_level
        );

        CREATE TABLE IF NOT EXISTS kataster.terms(
            id              int     PRIMARY KEY,
            officeid        int     REFERENCES kataster.offices(id),
            start           int,
            finish          int
        );

        CREATE TABLE IF NOT EXISTS kataster.parties(
            id              int     PRIMARY KEY,
            abbreviation    text,
            name            text    UNIQUE
        );

        CREATE TABLE IF NOT EXISTS kataster.politicians(
            id          serial  PRIMARY KEY,
            firstname   text,
            surname     text,
            title       text,
            dobhash     int
        );

        CREATE TABLE IF NOT EXISTS kataster.politicianterms(
            politicianid    int     REFERENCES kataster.politicians(id),
            termid          int     REFERENCES kataster.terms(id),
            party_nomid     int     REFERENCES kataster.parties(id),
            partyid         int     REFERENCES kataster.parties(id),
            source_url      text,
            picture_url     text,
            PRIMARY KEY (politicianid, termid)
        );
        """
    db_execute(db, q)

    # Insert offices
    path_offices = DIR_DATA + 'offices.json'
    offices = json_load(path_offices)
    columns_offices = ['id', 'name_male', 'name_female', 'level']
    db_insert_jsons(db, 'kataster.offices', offices, columns_offices)

    # Insert terms
    path_terms = DIR_DATA + 'terms.json'
    terms = json_load(path_terms)
    columns_terms = ['id', 'officeid', 'start', 'finish']
    db_insert_jsons(db, 'kataster.terms', terms, columns_terms)

    # Insert parties
    path_terms = DIR_DATA + 'parties.json'
    parties = json_load(path_terms)
    columns_parties = ['id', 'abbreviation', 'name']
    db_insert_jsons(db, 'kataster.parties', parties, columns_parties)

    # Insert poslanci NRSR
    path_poslanci_NRSR = DIR_DATA + 'poslanci_NRSR.json'
    poslanci_NRSR = json_load(path_poslanci_NRSR)
    for poslanec in poslanci_NRSR:
        poslanec['dobhash'] = hash_timestamp(datetime.strptime(poslanec['birthdate'], '%Y-%m-%dT%H:%M:%SZ'))
    poslanci_NRSR_sorted = sorted(poslanci_NRSR, key=lambda p: (p['PoslanecID'], p['CisObdobia']))
    poslanci_NRSR_unique = [next(group) for key, group in groupby(poslanci_NRSR_sorted, key=lambda p: p['PoslanecID'])]
    columns_politicians = ['firstname', 'surname', 'title', 'dobhash']
    db_insert_jsons(db, 'kataster.politicians', poslanci_NRSR_unique, columns_politicians)

    # Obtain assigned IDs
    q = """SELECT id, firstname, surname, dobhash FROM kataster.politicians;"""
    politicians = db_query(db, q)
    fsd_to_politicianid = {(p['firstname'], p['surname'], p['dobhash']): p['id'] for p in politicians}

    # Construct politicianterms relations for poslanci NRSR
    CisObdobia_to_termid = {term['CisObdobia']: term['id'] for term in terms if 'CisObdobia' in term}
    party_name_to_id = {party['name']: party['id'] for party in parties}
    for poslanec in poslanci_NRSR:
        # Obtain politicianid
        key_fsd = (poslanec['firstname'], poslanec['surname'], poslanec['dobhash'])
        politicianid = fsd_to_politicianid[key_fsd]

        # Obtain termid
        termid = CisObdobia_to_termid[poslanec['CisObdobia']]

        # Obtain partynom
        party_nom = poslanec['party_nom']
        party_nom_id = party_name_to_id[party_nom] if party_nom in party_name_to_id else '\N'

        # Insert the relation
        q = """
            INSERT INTO kataster.politicianterms(politicianid, termid, party_nomid, partyid, source_url, picture_url)
            VALUES (%s, %s, %s, %s, %s, %s)
            ON CONFLICT DO NOTHING;
            """
        q_data = (politicianid, termid, party_nom_id, None, poslanec['source'], poslanec['picture'])
        db_execute(db, q, q_data)

    # Commit changes and close connection to database
    db.commit()
    db.close()


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    args_dict = vars(parser.parse_args())
    try:
        main(args_dict)
    except:
        import pdb, sys, traceback
        type, value, tb = sys.exc_info()
        traceback.print_exc()
        pdb.post_mortem(tb)
        raise

