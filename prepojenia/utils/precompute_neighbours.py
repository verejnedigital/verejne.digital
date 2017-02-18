import codecs
import sys

from itertools import groupby
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
        surnames = [line.strip().decode('utf-8') for line in f.readlines()]

    # Read academic titles
    file_titles = 'utils/data_titles.txt'
    with codecs.open(file_titles, 'r') as f:
        titles = [line.strip().decode('utf-8') for line in f.readlines()]

    # Get entity data
    reader = read_entities.read_entities_mock
    #reader = read_entities.read_entities
    names, ids, lats, lngs = reader()
    num_entities = len(ids)

    # Arrange entities for sorting by location and subsequent grouping
    entities_for_grouping = [((lat, lng), name, iid) for name, iid, lat, lng in zip(names, ids, lats, lngs)]

    # Iterate through groups of entities sharing same (lat, lng)
    num_entities_seen = 0
    for location, group in groupby(sorted(entities_for_grouping), key=itemgetter(0)):
        _, names, ids = zip(*group)
        group_size = len(ids)
        #print('Location: %s; group size %d' % (str(location), group_size))
        for i in xrange(group_size):
            for j in xrange(i + 1, group_size):
                # Compute edge length (depends on group_size and any surnames similarity)
                
                # Check surname similarity
                similar_surnames = False
                parsed1 = parse_entity_name(names[i], surnames, titles)
                parsed2 = parse_entity_name(names[j], surnames, titles)
                if (parsed1 is not None) and (parsed2 is not None):
                    surname1 = parsed1['surname']
                    surname2 = parsed2['surname']
                    if surname1 == surname2:
                        similar_surnames = True
                    lcp = longest_common_prefix(surname1, surname2)
                    if (lcp >= 3) and (lcp >= len(surname1) - 3) and (lcp >= len(surname2) - 3):
                        #print('Similar surnames detected')
                        similar_surnames = True

                # Set edge length
                length = 1.0 if similar_surnames else (group_size + 1)

                # Print edge (instead of adding to database)
                if length < 5.0:
                    print('\nAdd edge of length %.2f between:' % (length))
                    print('    %d | %s' % (ids[i], names[i].encode('utf-8')))
                    print('    %d | %s' % (ids[j], names[j].encode('utf-8')))
        
        num_entities_seen += group_size
        print_progress('Processed entities: %d / %d = %.1f%%' % (num_entities_seen, num_entities, 100.0 * num_entities_seen / num_entities))
    print('')


if __name__ == '__main__':
    generate_edges()
