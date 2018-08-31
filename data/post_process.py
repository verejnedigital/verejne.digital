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

def notices_insert_into_extra_table(db, ids, embeddings, candidates, similarities, 
                                    best_suppliers, best_similarities):
    with db.dict_cursor() as cur:
        for idx, embedding, candidate, similarity, best_supplier, best_similarity in zip(ids, embeddings, candidates, similarities, best_suppliers, best_similarities):
            embedding = arrayize(embedding)
            candidate = arrayize(candidate, type_str = "integer")
            similarity = arrayize(similarity)
            best_sup = "NULL" if best_supplier is None else str(best_supplier)
            best_sim = "NULL" if best_similarity is None else str(best_similarity)
            cur.execute("INSERT INTO NoticesExtraData(notice_id, embedding, best_supplier,"
                        + " best_similarity, candidates, similarities) VALUES ( "
                        + str(idx) + ", " + embedding + ", " + best_sup
                        + ", " + best_sim + ", " + candidate + ", " + similarity + ");")

def notices_find_candidates(ids, embeddings, suppliers):
    candidates_list = []
    similarities_list = []
    best_suppliers = []
    best_similarities = []
    for idx, embedding, supplier in zip(ids, embeddings, suppliers):
        candidates = []
        similarities = []
        best_supplier = None
        best_similarity = None
        # If we do not know the winner already
        if supplier is None:
            # try all other candidates, but keep only similar
            for idx2, embedding2, supplier2 in zip(ids, embeddings, suppliers):
                # candidates are only the notices with known winners / suppliers
                if not supplier2 is None:
                    similarity = numpy.inner(embedding, embedding2)
                    if similarity > 0.8 and len(similarities) < 5:
                        print similarity, idx, idx2
                        similarities.append(similarity)
                        candidates.append(idx2)
                        if (best_supplier is None) or similarity > best_similarity:
                            best_supplier = supplier2
                            best_similarity = similarity
        candidates_list.append(candidates)
        similarities_list.append(similarities)
        best_suppliers.append(best_supplier)
        best_similarities.append(best_similarity)
    return candidates_list, similarities_list, best_suppliers, best_similarities


def post_process_notices(db):
    notices_create_extra_table(db)
    text_embedder = embed.FakeTextEmbedder()
    ids = []
    texts = []
    suppliers = []
    with db.dict_cursor() as cur:
        cur.execute("""
            SELECT id, concat_ws(' ', title, short_description) as text, supplier_eid 
            FROM Notices LIMIT 30;
        """)
        for row in cur:
            ids.append(row["id"])
            texts.append(row["text"])
            suppliers.append(row["supplier_eid"])
    embeddings = text_embedder.embed(texts)
    candidates, similarities, best_suppliers, best_similarities = notices_find_candidates(ids, embeddings, suppliers)
    notices_insert_into_extra_table(db, ids, embeddings, candidates, similarities, best_suppliers, best_similarities)

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
