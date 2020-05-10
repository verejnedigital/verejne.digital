import argparse
import os
import sys
import psycopg2
import psycopg2.extras

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../data/db')))
from db import DatabaseConnection


def google_translate(sk_text):
    """ CAUTION! This is a paid service! """
    from google.cloud import translate
    translate_client = translate.Client()
    result = translate_client.translate(sk_text, source_language='sk', target_language='en')
    result = result['translatedText']
    print("Google Translate: {} -> {}".format(sk_text, result))
    return result


def getConfig():
    import yaml
    with open("../db_config_update_source.yaml", "r") as stream:
        return yaml.load(stream)


def translate(sk_texts, verbose=False, enable_google_translate=False):
    """ Returns English translation of sk_texts """

    # Connect to the latest production data schema
    config = getConfig()
    db = psycopg2.connect(user=config["user"], dbname=config["db"])

    results = []
    cur = db.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute('SET search_path="translation_cache";')
    for sk_text in sk_texts:
        sql = "select en from translations where sk=%s"
        cur.execute(sql, (sk_text,))
        result = None
        for row in cur:
            result = row["en"]
        if result is None and enable_google_translate:
            # If the result is not in cache, use Google translate and remember the result.
            result = google_translate(sk_text)
            insert_sql = "insert into translations values(%s,%s)"
            cur.execute(insert_sql, (sk_text, result,))
        results.append(result)

    if verbose:
        for sk_text, result in zip(sk_texts, results):
            print("Translation: {}->{}".format(sk_text, result))

    # Close database connection
    db.commit()
    db.close()
    return results


def main(args_dict):
    verbose = args_dict['verbose']
    translate(["Ako sa mas?", "pes"], verbose=verbose, enable_google_translate=True)


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--verbose', default=False, action='store_true', help='Report progress to stdout')
    args_dict = vars(parser.parse_args())
    main(args_dict)
