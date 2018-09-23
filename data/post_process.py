"""Performs post processing on the latest prod schema."""
import argparse
import os
import sys
import numpy
import math
from intelligence import embed

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../data/db')))
from db import DatabaseConnection

from prod_generation import post_process_neighbours

import utils


class Notice:
    idx = None
    embedding = None
    best_supplier = None
    best_similarity = None
    candidates = None
    similarities = None
    supplier = None
    norm = None
    price = None

    def __init__(self, idx, embedding, supplier, price):
        self.idx = idx
        self.supplier = supplier
        self.embedding = embedding
        self.norm = numpy.linalg.norm(self.embedding)
        if self.norm == 0:
            self.norm = 1
        self.candidates = []
        self.similarities = []
        self.candidate_prices = []
        self.price = price

    def get_price_range(self):
        values = []
        for price in self.candidate_prices:
            if not price is None:
                values.append(price)
        if len(values) < 2:
            return None, None, None
        # TODO: consider doing these computation in log world.
        std_dev = numpy.std(values)
        mean = numpy.mean(values)
        # Here we compute 95% reliability interval
        price_low = mean - 1.96 * std_dev / math.sqrt(len(values))
        if price_low < 0:
            price_low = 0
        price_high = mean + 1.96 * std_dev / math.sqrt(len(values))
        return mean, price_low, price_high


def notices_create_extra_table(db, test_mode):
    """Creates table NoticesExtras that will contain extra data."""
    table_name_suffix = "_test" if test_mode else ""
    command = """
        CREATE TABLE NoticesExtras""" + table_name_suffix + """ (
          id SERIAL PRIMARY KEY,
          notice_id INTEGER,
          embedding FLOAT[],
          best_supplier INTEGER References Entities(id),
          best_similarity FLOAT,
          candidates INTEGER[],
          similarities FLOAT[],
          price_est FLOAT,
          price_est_low FLOAT,
          price_est_high FLOAT
        );
        CREATE INDEX ON NoticesExtras""" + table_name_suffix + """ (notice_id);
        """
    if test_mode:
        print(command)
    db.execute(command)



def arrayize(a, type_str="float"):
    length = len(a)
    a = ','.join(map(str, a))
    a = "ARRAY[" + a + "]"
    if length == 0:
        a = a + "::" + type_str + "[]"
    return a


def nullize(x):
    return "NULL" if x is None else str(x)


def notices_insert_into_extra_table(db, notices, test_mode):
    table_name_suffix = "_test" if test_mode else ""
    with db.dict_cursor() as cur:
        for notice in notices:
            price, price_low, price_high = notice.get_price_range()
            cur.execute("INSERT INTO NoticesExtras" + table_name_suffix + "(notice_id, embedding, best_supplier,"
                        + " best_similarity, candidates, similarities, price_est, price_est_low, price_est_high) VALUES ( "
                        + str(notice.idx) + ", " + arrayize(notice.embedding) + ", " + nullize(notice.best_supplier)
                        + ", " + nullize(notice.best_similarity) + ", " + arrayize(notice.candidates)
                        + ", " + arrayize(notice.similarities) + ", " + nullize(price) + ", " + nullize(price_low)
                        + ", " + nullize(price_high) + ");")


def notices_find_candidates(notices):
    print 'finding candidates'
    for notice in notices:
        # If we do not know the winner already
        if notice.supplier is None:
            # try all other candidates, but keep only similar
            for notice2 in notices:
                # candidates are only the notices with known winners / suppliers
                if not notice2.supplier is None:
                    similarity = numpy.inner(notice.embedding, notice2.embedding) / (notice.norm * notice2.norm)
                    if similarity > 0.75 and len(notice.similarities) < 300:
                        notice.similarities.append(similarity)
                        notice.candidates.append(notice2.idx)
                        notice.candidate_prices.append(notice2.price)
                        if (notice.best_supplier is None) or (similarity > notice.best_similarity):
                            notice.best_supplier = notice2.supplier
                            notice.best_similarity = similarity
            # keep only top 20 candidates and sort them by similarity
            if len(notice.candidates) > 0:
                sorted_lists = sorted(izip(notice.similarities, notice.candidates, notice.candidate_prices), reverse=True, key=lambda x: x[0])
                notice.similarities, notice.candidates, notice.candidate_prices = [[x[i][:20] for x in sorted_lists] for i in range(3)]
    return notices


def _post_process_notices(db, test_mode):
    notices_create_extra_table(db, test_mode)
    ids = []
    texts = []
    suppliers = []
    notices = []

    # TODO: once we use universal sentence encoder, use also description, not only title as text to be embedded.
    query = """
      SELECT
        notice_id,
        title as text,
        supplier_eid,
        total_final_value_amount as price
      FROM notices
      """ + (" LIMIT 1000" if test_mode else "")
    rows = db.query(query)

    all_texts = [row["text"] for row in rows]
    print 'Number of notices: ', len(all_texts)
    text_embedder = embed.Word2VecEmbedder(all_texts)
    for row in rows:
        embedding = text_embedder.embed([row["text"]])
        if embedding is None or len(embedding) == 0:
            continue
        notices.append(
            Notice(row["notice_id"],
                   embedding[0],
                   row["supplier_eid"],
                   row["price"]))
    notices = notices_find_candidates(notices)
    notices_insert_into_extra_table(db, notices, test_mode)


def _post_process_neighbours(db, test_mode):
    """Adds edges between neighbours."""
    post_process_neighbours.add_family_and_neighbour_edges(
        db, test_mode)


def _post_process_flags(db, test_mode):
    """Precomputes entity flags and address flags."""
    path_script = os.path.join(
        "prod_generation", "compute_entity_and_address_flags.sql")
    utils.execute_script(db, path_script)


def do_post_processing(db, test_mode=False):
    """Performs post processing on the provided database `db`.

    The argument `db` is provided from outside, so that this procedure
    can be invoked both
    - from an outside process, e.g. generate_prod_data, or
    - statically on its own from this file.

    Args:
      db: An open DatabaseConnection for which `search_path` has
          already been set to the production schema on which post
          processing is to be performed.
      test_mode: Boolean indicating whether a quick test run with no
          side effects is desired.
    """
    print('[OK] Postprocessing...')

    # Order matters: post processing neighbours creates edges that
    # can be exploited when post processing flags, for example.
    _post_process_neighbours(db, test_mode)
    _post_process_flags(db, test_mode)
    _post_process_notices(db, test_mode)


def main(args_dict):
    # Handle test mode option:
    test_mode = not args_dict['disable_test_mode']
    if test_mode:
        print("[OK] Running in TEST mode...")

    # Connect to the latest production data schema:
    db = DatabaseConnection(path_config='db_config_update_source.yaml')
    schema = db.get_latest_schema('prod_')
    db.execute('SET search_path="' + schema + '";')
    print('[OK] Postprocessing schema "%s"...' % (schema))
    do_post_processing(db, test_mode)

    # Grant SELECT on any new tables to our applications:
    db.grant_select_on_schema(schema, 'data')
    db.grant_select_on_schema(schema, 'verejne')
    db.grant_select_on_schema(schema, 'kataster')
    db.grant_select_on_schema(schema, 'prepojenia')
    db.grant_select_on_schema(schema, 'obstaravania')

    if test_mode:
        db.conn.rollback()
        print('[OK] Rolled back changes (test mode).')
    else:
        db.commit()
    db.close()

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--disable_test_mode',
                        default=False,
                        action='store_true',
                        help='Disable test mode.')
    args_dict = vars(parser.parse_args())
    main(args_dict)
