import argparse

from datetime import datetime

from status import get_source_data_info, get_prod_data_info
from utils import json_load


def SourceDataInfo():
    result = get_source_data_info()
    print(result)
def ProdDataInfo():
    result = get_prod_data_info()
    print(result)

def main(args_dict):
    if args_dict['command'] == 'SourceDataInfo':
        SourceDataInfo()
    if args_dict['command'] == 'ProdDataInfo':
        ProdDataInfo()

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    sp = parser.add_subparsers(dest='command')
    sp_SourceDataInfo = sp.add_parser('SourceDataInfo')
    sp_ProdDataInfo = sp.add_parser('ProdDataInfo')

    args_dict = vars(parser.parse_args())
    try:
        main(args_dict)
    except:
        import pdb, sys, traceback
        type, value, tb = sys.exc_info()
        traceback.print_exc()
        pdb.post_mortem(tb)
        raise
