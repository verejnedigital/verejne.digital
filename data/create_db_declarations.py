import argparse

from db import db_connect, db_execute, db_insert_json
from utils import json_load


def main(args_dict):
    # Load information about database columns
    path_db_config = 'db_asset_declarations.json'
    db_config = json_load(path_db_config)

    # Create the database
    db = db_connect('kataster', 'matej_balog')
    q = """CREATE TABLE IF NOT EXISTS kataster.AssetDeclarations(id serial PRIMARY KEY"""
    for column in db_config:
        null_text = ' NOT NULL' if column['not_null'] else ''
        q += ',\n%s %s %s' % (column['db_name'], column['db_type'], null_text)
    q += """);
        ALTER TABLE kataster.AssetDeclarations ADD UNIQUE (declaration_id);"""
    db_execute(db, q)

    # If provided, insert parsed declarations from JSON into the database
    path_declarations = args_dict['declarations']
    if path_declarations is not None:
        key_to_column = {column['key']: column['db_name'] for column in db_config}
        declarations = json_load(path_declarations)
        key_year_old = u'ozn\xe1menie za rok'
        for declaration in declarations:
            del declaration[key_year_old]
            declaration_db = {}
            for key in declaration:
                # Replace years in keys
                key_normalised = key
                str_subs = 'za rok ' + str(declaration['year'])
                if str_subs in key:
                    key_normalised = key.replace(str_subs, 'za rok year')
                declaration_db[key_to_column[key_normalised]] = declaration[key]
            db_insert_json(db, 'kataster.AssetDeclarations', declaration_db)

    # Commit the changes to the database and close the connection
    db.commit()
    db.close()


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--declarations', dest='declarations', help='JSON file with parsed asset declarations', action='store')
    parser.add_argument('--verbose', default=0, type=int, help='Verbosity level')
    args_dict = vars(parser.parse_args())
    try:
        main(args_dict)
    except:
        import pdb, sys, traceback
        type, value, tb = sys.exc_info()
        traceback.print_exc()
        pdb.post_mortem(tb)
        raise
