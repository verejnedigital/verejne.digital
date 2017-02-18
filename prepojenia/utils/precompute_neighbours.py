import codecs
import sys

from collections import defaultdict
from itertools import groupby
from math import ceil
from operator import itemgetter

import read_entities

"""
Input:
    names: list
    ids: list
    lat: list
    lng: list
Goal:
    Generate list of edges (id1, id2) with type and length.
    Length should depend on:
    (1) Number of entities sharing coordinates
    (2) Similarity of entity names (e.g. similar surnames)
"""

def print_progress(string):
    sys.stdout.write('\r%s' % (string))
    sys.stdout.flush()

def longest_common_prefix(str1, str2):
    i = 0
    while i < min(len(str1), len(str2)):
        if str1[i] != str2[i]:
            break
        i += 1
    return i

def parse_entity_name(entity_name, surnames, titles, verbose=False):
    """
    Input: entity_name (can contain academic titles and name of Zivnost)
    Output:
        if parse is successful: dictionary containing
            firstnames: list of given names (of length at least 1)
            surname: string
        otherwise:
            None
    """
    
    if verbose:
        print('entity_name = |%s|' % (entity_name))

    # Trim name of Zivnost, followed by first occurrence of (' - ')
    p = entity_name.find(' - ')
    if (p > 0):
        name = entity_name[:p]
    else:
        name = entity_name
    if verbose:
        print('name = |%s|' % (name))

    # Trim known academic titles
    name_clean = name
    finished = False
    while not finished:
        finished = True
        for title in titles:
            d = len(title) + 1 # number of characters to trim
            if name_clean.startswith(title + '.') or name_clean.startswith(title + ' '):
                name_clean = name_clean[d:]
                finished = False
            elif name_clean.endswith(' ' + title) or name_clean.endswith(',' + title):
                name_clean = name_clean[:-d]
                finished = False
            elif name_clean.endswith(title + '.'):
                name_clean = name_clean[:-d]
                finished = False
            name_clean = name_clean.strip(' ,')
    if verbose:
        print('name_clean = |%s|' % (name_clean))

    # Split cleaned name, should be list of firstnames followed by a surname
    names = name_clean.split()

    # Check that last name is a surname
    if len(names) >= 2 and names[-1] in surnames:
        return {
            'firstnames': names[:-1],
            'surname': names[-1],
        }
    else:
        if verbose:
            print('Parse failed')
        return None

def generate_edges():
    # Read surnames
    file_surnames = 'utils/data_surnames2.txt'
    with codecs.open(file_surnames, 'r') as f:
        surnames = set([line.strip().decode('utf-8') for line in f.readlines()])

    # Read academic titles
    file_titles = 'utils/data_titles.txt'
    with codecs.open(file_titles, 'r') as f:
        titles = [line.strip().decode('utf-8') for line in f.readlines()]

    # Get entity data
    #reader = read_entities.read_entities_mock
    reader = read_entities.read_entities
    names, ids, lats, lngs = reader()
    num_entities = len(ids)

    # Arrange entities for sorting by location and subsequent grouping
    entities_for_grouping = [((lat, lng), name, iid) for name, iid, lat, lng in zip(names, ids, lats, lngs)]

    # Iterate through groups of entities sharing same (lat, lng)
    file_output = '/tmp/output/edges.txt'
    num_entities_seen = 0
    num_edges = defaultdict(float)
    last_promile = -1.0
    with open(file_output, 'w') as f:
        for location, group in groupby(sorted(entities_for_grouping), key=itemgetter(0)):
            _, names, ids = zip(*group)
            group_size = len(ids)
            #print('Location: %s; group size %d' % (str(location), group_size))

            # Parse names in this group
            names_parsed = [parse_entity_name(name, surnames, titles) for name in names]

            for i in xrange(group_size):
                for j in xrange(i + 1, group_size):
                    # Compute edge length (depends on group_size and any surnames similarity)
                    
                    # Check surname similarity
                    similar_surnames = False
                    if (names_parsed[i] is not None) and (names_parsed[j] is not None):
                        surname1 = names_parsed[i]['surname']
                        surname2 = names_parsed[j]['surname']

                        if surname1 == surname2:
                            similar_surnames = True

                        lcp = longest_common_prefix(surname1, surname2)
                        if (lcp >= 3) and (lcp >= len(surname1) - 3) and (lcp >= len(surname2) - 1) and (surname1[-1] in ['a', u'\xe1']):
                            similar_surnames = True
                        if (lcp >= 3) and (lcp >= len(surname1) - 1) and (lcp >= len(surname2) - 3) and (surname2[-1] in ['a', u'\xe1']):
                            similar_surnames = True

                    # Set edge length
                    length = 1.0 if similar_surnames else (group_size + 1)

                    # Print edge (instead of adding to database)
                    if length < 5.0:
                        f.write('Add edge of length %.2f between:\n' % (length))
                        f.write('    %d | %s\n' % (ids[i], names[i].encode('utf-8')))
                        f.write('    %d | %s\n' % (ids[j], names[j].encode('utf-8')))
                        num_edges[length] += 1

            num_entities_seen += group_size

            promile = 1000.0 * num_entities_seen / num_entities
            if promile > last_promile:
                report_entities = 'Processed entities: %d / %d = %.1f%%' % (num_entities_seen, num_entities, promile / 10)
                report_edges = 'Edges: ' + ', '.join(['%.0f: %d' % (l, num_edges[l]) for l in sorted(num_edges.keys())])
                print_progress(report_entities + '; ' + report_edges)
                last_promile = ceil(promile)
    print('')


if __name__ == '__main__':
    generate_edges()
