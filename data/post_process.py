import argparse
import os
import sys
import numpy
import math
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
    price = None

    def __init__(self, idx, embedding, supplier, price):
        self.idx = idx
        self.supplier = supplier
        self.embedding = embedding
        self.norm = numpy.linalg.norm(self.embedding)
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
        price_high = mean + 1.96 * std_dev / math.sqrt(len(values))
        return mean, price_low, price_high


def notices_create_extra_table(db):
    """Creates table NoticesExtraData that will contain extra data."""
    db.execute(
        """
        DROP TABLE IF EXISTS NoticesExtraData;
        CREATE TABLE NoticesExtraData (
          id SERIAL PRIMARY KEY,
          notice_id INTEGER References Notices(id),
          embedding FLOAT[],
          best_supplier INTEGER References Entities(id),
          best_similarity FLOAT,
          candidates INTEGER[],
          similarities FLOAT[],
          price_est FLOAT,
          price_est_low FLOAT,
          price_est_high FLOAT
        );
        CREATE INDEX ON NoticesExtraData (notice_id);
        """
    )


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
            price, price_low, price_high = notice.get_price_range()
            cur.execute("INSERT INTO NoticesExtraData(notice_id, embedding, best_supplier,"
                        + " best_similarity, candidates, similarities, price_est, price_est_low, price_est_high) VALUES ( "
                        + str(notice.idx) + ", " + arrayize(notice.embedding) + ", " + nullize(notice.best_supplier)
                        + ", " + nullize(notice.best_similarity) + ", " + arrayize(notice.candidates)
                        + ", " + arrayize(notice.similarities) + ", " + nullize(price) + ", " + nullize(price_low)
                        + ", " + nullize(price_high) + ");")


def notices_find_candidates(notices):
    for notice in notices:
        if notice.idx % 1000 == 0:
            print "progress:", notice.idx, len(notices)
        # If we do not know the winner already
        if notice.supplier is None:
            # try all other candidates, but keep only similar
            for notice2 in notices:
                # candidates are only the notices with known winners / suppliers
                if not notice2.supplier is None:
                    similarity = numpy.inner(notice.embedding, notice2.embedding) / (notice.norm * notice2.norm)
                    if similarity > 0.75 and len(notice.similarities) < 5:
                        notice.similarities.append(similarity)
                        notice.candidates.append(notice2.idx)
                        notice.candidate_prices.append(notice2.price)
                        if (notice.best_supplier is None) or (similarity > notice.best_similarity):
                            notice.best_supplier = notice2.supplier
                            notice.best_similarity = similarity
    return notices


def post_process_notices(db, test_mode):
    notices_create_extra_table(db)
    text_embedder = embed.FakeTextEmbedder()
    ids = []
    texts = []
    suppliers = []
    notices = []
    with db.dict_cursor() as cur:
        test_mode_suffix = " LIMIT 100" if test_mode else ""
        cur.execute("""
            SELECT
                id,
                concat_ws(' ', title, short_description) as text,
                supplier_eid,
                total_final_value_amount as price
            FROM Notices""" + test_mode_suffix + """;
        """)
        for row in cur:
            notices.append(
                Notice(row["id"],
                       text_embedder.embed([row["text"]])[0],
                       row["supplier_eid"],
                       row["price"]))
    notices = notices_find_candidates(notices)
    notices_insert_into_extra_table(db, notices)


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
    post_process_notices(db, test_mode)


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
