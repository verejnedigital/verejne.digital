import codecs

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

def parse_entity_name(entity_name, surnames, titles):
    """
    Input: entity_name (can contain academic titles and name of Zivnost)
    Output:
        if parse is successful: dictionary containing
            firstnames: list of given names (of length at least 1)
            surname: string
        otherwise:
            None
    """
    
    # Trim name of Zivnost, followed by first occurrence of (' - ')
    p = entity_name.find(' - ')
    if (p > 0):
        name = entity_name[:p]
    else:
        name = entity_name
    print('|%s|' % (name))

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
    print('|%s|' % (name_clean))

    # Split cleaned name, should be list of firstnames followed by a surname
    names = name_clean.split()

    # Check that last name is a surname
    if len(names) >= 2 and names[-1] in surnames:
        return {
        	'firstnames': names[:-1],
        	'surname': names[-1],
        }
    else:
        print('Parse failed')
        return None


def generate_edges():
	# Read surnames
	file_surnames = 'data_surnames2.txt'
	with codecs.open(file_surnames, 'r') as f:
	    surnames = [line.strip().decode('utf-8') for line in f.readlines()]

	# Read academic titles
	file_titles = 'data_titles.txt'
	with codecs.open(file_titles, 'r') as f:
	    titles = [line.strip().decode('utf-8') for line in f.readlines()]

	# Get entity data
	names, ids, lats, lngs = read_entities.read_entities_mock()

	# Arrange entities for sorting by location and subsequent grouping
	entities_for_grouping = [((lat, lng), name, iid) for name, iid, lat, lng in zip(names, ids, lats, lngs)]

	# Iterate through groups of entities sharing same (lat, lng)
	for location, group in groupby(sorted(entities_for_grouping), key=itemgetter(0)):
	    _, names, ids = zip(*group)
	    print('Location: %s' % (str(location)))
	    for i in xrange(len(names)):
	        for j in xrange(i + 1, len(names)):
	            print('Add edge between:')
	            print('    %d | %s' % (ids[i], names[i]))
	            print('    %d | %s' % (ids[j], names[j]))
	            print('    (length TBD)')

if __name__ == '__main__':
    generate_edges()
