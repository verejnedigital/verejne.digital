import os
import argparse

from db.db import DatabaseConnection


def pretty_print(schemas: list) -> None:
    """
    Pretty print all available schemas.
    :param schemas: list(str) - schemas to list
    :return: None
    """
    print('Available schemas:')
    for i, schema in enumerate(schemas):
        print('{i:3d} {schema}'.format(i=i, schema=schema))


def main(args_dict):
    # connect to Database
    db_conn = DatabaseConnection(path_config=os.path.abspath(os.path.join(os.path.dirname(__file__), 'db_config_update_source.yaml')))

    # list schemas
    schemas = db_conn.list_schemas()
    pretty_print(schemas)

    if args_dict.rename:
        # ask for rename
        print('Number to rename (q to quit): ')
        inp = input()
        try:
            to_del_num = int(inp)
        except ValueError:
            print('Exiting')
            to_del_num = -1

        if 0 <= to_del_num < len(schemas):
            # ask for renaming to
            print('Rename schema {schema} to (provide new name): '.format(schema=schemas[to_del_num]))
            new_name = input()
            db_conn.rename_schema(schemas[to_del_num], new_name, verbose=True)
            db_conn.commit()

    else:
        # ask for deletion
        print('Number(s) to delete (comma separated, q to quit): ')
        inp = input()
        to_del_nums = inp.split(',')
        try:
            to_del_nums = list(map(int, to_del_nums))
        except ValueError:
            print('Exiting')
            to_del_nums = []

        if to_del_nums != []:
            # ask if delete
            print('Deleting schema(s) {schema}? (Y/N):'.format(schema=', '.join([schemas[to_del_num] for to_del_num in to_del_nums])))
            if str(input()).upper() != 'Y':
                print('Aborted deletion')
            else:
                # delete:
                for to_del_num in to_del_nums:
                    if 0 <= to_del_num < len(schemas):
                        db_conn.remove_schema(schemas[to_del_num], verbose=True)
                db_conn.commit()


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--rename', default=False, action='store_true', help='Rename, not delete')
    args_dict = parser.parse_args()
    main(args_dict)
