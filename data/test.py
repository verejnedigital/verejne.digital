import argparse

from datetime import datetime

from status import get_source_data_info
from utils import json_load


def SourceDataStatus():
    result = get_source_data_info()
    print(result)

def main(args_dict):
    if args_dict['command'] == 'SourceDataStatus':
        SourceDataStatus()

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    sp = parser.add_subparsers(dest='command')

    # Source data status
    sp_sds = sp.add_parser('SourceDataStatus')

    args_dict = vars(parser.parse_args())
    try:
        main(args_dict)
    except:
        import pdb, sys, traceback
        type, value, tb = sys.exc_info()
        traceback.print_exc()
        pdb.post_mortem(tb)
        raise
