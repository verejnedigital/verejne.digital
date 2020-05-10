import argparse

from utils import json_load, json_dump_utf8


def load_results(path_load):
    j = json_load(path_load)

    # TEMP
    # return j['results']

    count = j['count']
    assert j['next'] is None
    results = j['results']
    assert len(results) == count
    print('[OK] Loaded %d results from %s' % (count, path_load))
    return results


def flatten_dict(d, prefix=''):
    """ Recursively flattens nested dictionaries.
        Warning: Eliminates any lists!
    """
    result = {}
    for key in d:
        if isinstance(d[key], str):
            result[prefix + key] = d[key]
        elif isinstance(d[key], dict):
            prefix = key + '_'
            subdict_flattened = flatten_dict(d[key], prefix=prefix)
            result.update(subdict_flattened)
    return result


def main(args_dict):
    path_load = args_dict['path_load']
    path_save = args_dict['path_save']
    # verbose = args_dict['verbose']

    results = load_results(path_load)
    results = list(map(flatten_dict, results))
    json_dump_utf8(results, path_save)
    print('[OK] Saved flattened results to %s' % path_save)


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('path_load', type=str, help='path to raw downloaded JSON file')
    parser.add_argument('path_save', type=str, help='path where to save flattened JSON')
    parser.add_argument('--verbose', default=0, type=int, help='Verbosity level')
    args_dict = vars(parser.parse_args())
    try:
        main(args_dict)
    except:
        import pdb
        import sys
        import traceback

        _, _, tb = sys.exc_info()
        traceback.print_exc()
        pdb.post_mortem(tb)
        raise
