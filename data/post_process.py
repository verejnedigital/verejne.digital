import argparse
import os
import sys
import numpy
from intelligence import embed

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../data/db')))
from db import DatabaseConnection

"""
Script to run post processing on the latest prod schema.
"""
class Notice:
    idx = None
    embedding = None
    best_supplier = None
    best_similarity = None
    candidates = None
    similarities = None
    supplier = None
    norm = None

    def __init__(self, idx, embedding, supplier):
        self.idx = idx
        self.supplier = supplier
        self.embedding = embedding
        self.norm = numpy.linalg.norm(self.embedding)
        self.candidates = []
        self.similarities = []

# Create table that will contain extra data
def notices_create_extra_table(db):
    with db.dict_cursor() as cur:
        cur.execute("""
            DROP TABLE IF EXISTS NoticesExtraData;
            CREATE TABLE NoticesExtraData (
                id SERIAL PRIMARY KEY,
                notice_id INTEGER References Notices(id),
                embedding FLOAT[],
                best_supplier INTEGER References Entities(id),
                best_similarity FLOAT,
                candidates INTEGER[],
                similarities FLOAT[]
            );
            CREATE INDEX ON NoticesExtraData (notice_id);
        """)

def arrayize(a, type_str="float"):
    length = len(a)
    a = ','.join(map(str, a))
    a = "ARRAY[" + a + "]"
    if length == 0:
        a = a + "::" + type_str + "[]"
    return a

def nullize(x):
    return "NULL" if x is None else str(x) 

def notices_insert_into_extra_table(db, notices):
    with db.dict_cursor() as cur:
        for notice in notices:
            cur.execute("INSERT INTO NoticesExtraData(notice_id, embedding, best_supplier,"
                        + " best_similarity, candidates, similarities) VALUES ( "
                        + str(notice.idx) + ", " + arrayize(notice.embedding) + ", " + nullize(notice.best_supplier)
                        + ", " + nullize(notice.best_similarity) + ", " + arrayize(notice.candidates)
                        + ", " + arrayize(notice.similarities) + ");")

def notices_find_candidates(notices):
    for notice in notices:
        print notice.idx, notice.supplier
        # If we do not know the winner already
        if notice.supplier is None:
            # try all other candidates, but keep only similar
            for notice2 in notices:
                # candidates are only the notices with known winners / suppliers
                if not notice2.supplier is None:
                    similarity = numpy.inner(notice.embedding, notice2.embedding) / (notice.norm * notice2.norm)
                    if similarity > 0.75 and len(notice.similarities) < 5:
                        print similarity, notice.idx, notice2.idx
                        notice.similarities.append(similarity)
                        notice.candidates.append(notice2.idx)
                        if (notice.best_supplier is None) or (similarity > notice.best_similarity):
                            notice.best_supplier = notice2.supplier
                            notice.best_similarity = similarity
    return notices


def post_process_notices(db):
    notices_create_extra_table(db)
    text_embedder = embed.FakeTextEmbedder()
    ids = []
    texts = []
    suppliers = []
    notices = []
    with db.dict_cursor() as cur:
        cur.execute("""
            SELECT id, concat_ws(' ', title, short_description) as text, supplier_eid 
            FROM Notices LIMIT 50;
        """)
        text_embedder = embed.FakeTextEmbedder()
        for row in cur:
            notices.append(Notice(row["id"], text_embedder.embed([row["text"]])[0], row["supplier_eid"]))
    notices = notices_find_candidates(notices)
    notices_insert_into_extra_table(db, notices)

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
