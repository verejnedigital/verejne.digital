import argparse
import os
import sys
from intelligence import embed

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../data/db')))
from db import DatabaseConnection

"""
Script to run post processing on the latest prod schema.
"""

def post_process_notices(db):
    # Create table that will contain extra data
    with db.dict_cursor() as cur:
        cur.execute("""
            DROP TABLE IF EXISTS NoticesExtraData;
            CREATE TABLE NoticesExtraData (
                id SERIAL PRIMARY KEY,
                notice_id INTEGER References Notices(id),
                embedding INTEGER[]
            );
            CREATE INDEX ON NoticesExtraData (notice_id);
        """)
    text_embedder = embed.FakeTextEmbedder()
    with db.dict_cursor() as cur:
        cur.execute("""
            SELECT id, concat_ws(' ', title, short_description) as text FROM Notices LIMIT 3;
        """)
        for row in cur:
            print 'id: ', row["id"]
            print 'text: ', row["text"]
            print 'embed: ', text_embedder.embed([row["text"]])[0]

"""
db input is provided from outside, so that it can be called
- from outside process, e.g. generate_prod_data
- statically on its own from this file.
"""
def do_post_processing(db):
    print 'Postprocessing'
    post_process_notices(db)


def main(args_dict):
    verbose = args_dict['verbose']
    # Connect to the latest production data schema
    db = DatabaseConnection(path_config='db_config_update_source.yaml')
    schema = db.get_latest_schema('prod_')
    db.execute('SET search_path="' + schema + '";')
    print('[OK] Postprocessing schema "%s"...' % (schema))
    do_post_processing(db)
    # We rollback the changes by default as this is supposed to be run in test mode.
    db.conn.rollback()
    db.close()

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--verbose', default=False, action='store_true', help='Report progress to stdout')
    args_dict = vars(parser.parse_args())
    main(args_dict)
