import io
import json
import os
import sys

from itertools import groupby


# REPORTING
class color:
   GREEN = '\x1b[1;32m'
   RED = '\x1b[1;31m'
   BLUE = '\x1b[0;34m'
   YELLOW = '\x1b[1;33m'
   END = '\x1b[0m'
   
def print_progress(string):
    sys.stdout.write('\r%s' % (string))
    sys.stdout.flush()


# JSON
def json_load(path):
    with open(path, 'r') as f:
        data_json = json.load(f)
    return data_json

def json_dump(var, path, indent=4):
    with open(path, 'wb') as f:
        json.dump(var, f, indent=indent, sort_keys=True, separators=(',', ': '))

def json_dump_utf8(var, path, indent=4, flatten_level=None):
    with io.open(path, 'w', encoding='utf-8') as f:
        data = json.dumps(var, f, indent=indent, sort_keys=True, separators=(',', ': '), ensure_ascii=False)
        if (indent is not None) and (flatten_level is not None):
            flatten_string = '\n' + ' '*(indent*flatten_level)
            data = data.replace(flatten_string, ' ')
            data = data.replace('\n' + ' '*(indent*(flatten_level-1)) + ']', ']')
        f.write(unicode(data))


# IO
def readlines_utf8(path_file):
    with open(path_file, 'r') as f:
        lines = [line.decode('utf-8').strip() for line in f.readlines()]
    return lines


# SYSTEM
def touch_directory(directory):
    if not os.path.exists(directory):
        os.makedirs(directory)
    return directory

def normalize_dir_path(directory):
    return directory + ('' if directory.endswith('/') else '/')


# FILE PROCESSING
def find_line_containing(target, lines):
    contain = [li for li, line in enumerate(lines) if target in line]
    if len(contain) == 0:
        print('%sERROR%s String %s not found in provided lines' % (color.RED, color.END, target))
        return None
    if len(contain) >= 2:
        print('%sERROR%s String %s found %d times in provided lines' % (color.RED, color.END, target, len(contain)))
        return None
    return contain[0]


# HTML PARSING
def extract_from_tag(string):
    """ From a string of the form <...>xyz</...> extracts xyz. """
    start = string.find('>') + 1
    end = string.rfind('<')
    return string[start:end].replace('&nbsp;', '').strip()


# LIST MANIPULATION
def get_counts_and_values(my_list, limit=None, decreasing=True):
    return sorted([(len(list(group)), key) for key, group in groupby(sorted(my_list))], reverse=decreasing)[:limit]

