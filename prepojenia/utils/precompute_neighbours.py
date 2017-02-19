import codecs
import sys
import json
import psycopg2
import psycopg2.extras
import yaml

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

def log(s):
    print "LOG: " + s

def print_progress(string):
    sys.stdout.write('\r%s' % (string))
    sys.stdout.flush()

def read_surnames():
    """ Reads in a list of surnames from the provided data file """
    file_surnames = 'utils/data_surnames2.txt'
    with codecs.open(file_surnames, 'r') as f:
        surnames = set([line.strip().decode('utf-8') for line in f.readlines()])
    return surnames

def read_titles():
    """ Reads in a list of academic titles from the provided data file """
    file_titles = 'utils/data_titles.txt'
    with codecs.open(file_titles, 'r') as f:
        titles = [line.strip().decode('utf-8') for line in f.readlines()]
    return titles

def longest_common_prefix(str1, str2):
    """ Returns the length of the longest common prefix of two provided strings """
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
            titles_pre: list of titles detected before name
            firstnames: list of given names (of length at least 1)
            surname: string
            titles_suf: list of titles detected after name
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
    titles_pre = []
    titles_suf = []
    while not finished:
        finished = True
        for title in titles:
            d = len(title) + 1 # number of characters to trim
            if name_clean.startswith(title + '.') or name_clean.startswith(title + ' '):
                name_clean = name_clean[d:]
                titles_pre.append(title)
                finished = False
            elif name_clean.endswith(' ' + title) or name_clean.endswith(',' + title):
                name_clean = name_clean[:-d]
                titles_suf.append(title)
                finished = False
            elif name_clean.endswith(title + '.'):
                name_clean = name_clean[:-d]
                titles_suf.append(title)
                finished = False
            name_clean = name_clean.strip(' ,')
    if verbose:
        print('name_clean = |%s|' % (name_clean))

    # Split cleaned name, should be list of firstnames followed by a surname
    names = name_clean.split()

    # Strict matching: Check that last name is a surname
    # if len(names) >= 2 and names[-1] in surnames:
    #     return {
    #         'titles_pre': titles_pre,
    #         'firstnames': names[:-1],
    #         'surname': names[-1],
    #         'titles_suf': titles_suf,
    #     }

    # Less conservative matching: Find the last token that is a surname,
    # and take the rest before it as given names
    i = len(names) - 1
    while (i >= 1) and (names[i] not in surnames):
        i -= 1
    if i >= 1:
        return {
            'titles_pre': titles_pre,
            'firstnames': names[:i],
            'surname': names[i],
            'titles_suf': titles_suf,
        }
    else:
        if verbose:
            print('Parse failed')
        return None

def compute_edge_length(name1, name2, group_size):
    # Check surname similarity
    similar_surnames = False
    if (name1 is not None) and (name2 is not None):
        surname1 = name1['surname']
        surname2 = name2['surname']

        if surname1 == surname2:
            similar_surnames = True

        lcp = longest_common_prefix(surname1, surname2)
        if (lcp >= 3) and (lcp >= len(surname1) - 3) and (lcp >= len(surname2) - 1) and (surname1[-1] in ['a', u'\xe1']):
            similar_surnames = True
        if (lcp >= 3) and (lcp >= len(surname1) - 1) and (lcp >= len(surname2) - 3) and (surname2[-1] in ['a', u'\xe1']):
            similar_surnames = True

    # Compute edge length
    length = 1.0 if similar_surnames else (group_size + 1)
    return length

def is_merge_desired(name1, name2):
    """ Input:
        name1, name2: string
                      parsednames as returned by parse_entity_name
        Output:
        True iff the two names have equal surnames and
            last first names are equal.
    """

    if (name1 is None) or (name2 is None):
        return False
    if (name1['surname'] != name2['surname']):
        return False

    fns1 = name1['firstnames']
    fns2 = name2['firstnames']
    # Transitive relation: last first names match
    return fns1[-1] == fns2[-1]

    # Non-transitive relation: list of first names is prefix of another
    # for i in xrange(min(len(fns1), len(fns2))):
    #     if fns1[i] != fns[2]:
    #         return False
    # return True

def consolidate_people():
    # Get helper data
    surnames = read_surnames()
    titles = read_titles()
    
    # Get entity data
    #reader = read_entities.read_entities_mock
    reader = read_entities.read_entities
    names, ids, lats, lngs = reader()
    num_entities = len(ids)

    # Arrange entities for sorting by location and subsequent grouping
    entities_for_grouping = [((lat, lng), name, iid) for name, iid, lat, lng in zip(names, ids, lats, lngs)]

    # Initialize eIDs to equal IDs
    eIDs = {iid: iid for iid in ids}

    # Edges are tuples (ID1, ID2, length)
    edges = []

    # Iterate through groups of entities sharing same (lat, lng)
    num_entities_seen = 0
    num_edges = defaultdict(float)
    num_merged = 0
    last_promile = -1.0
    for location, group in groupby(sorted(entities_for_grouping), key=itemgetter(0)):
        # Get IDs and names in this group, sorted by increasing ID
        ids, names = zip(*sorted([(iid, name) for _, name, iid in group]))
        group_size = len(ids)
        #print('Location: %s; group size %d' % (str(location), group_size))

        # Parse names in this group
        names_parsed = [parse_entity_name(name, surnames, titles, verbose=False) for name in names]

        # Iterate through distinct pairs of entities at this location
        for i in xrange(group_size):
            for j in xrange(i + 1, group_size):
                # Check if merge should happen
                if is_merge_desired(names_parsed[i], names_parsed[j]):
                    if eIDs[ids[j]] > ids[i]:
                        # Thanks to sorting ids[i] < ids[j]
                        eIDs[ids[j]] = ids[i]
                        num_merged += 1
                        #print('Set eID of %d to %d' % (ids[j], ids[i]))

                # Compute edge length (depends on group_size and any surnames similarity)
                length = compute_edge_length(names_parsed[i], names_parsed[j], group_size)
                if length < 5.0:
                    edges.append((ids[i], ids[j], length))
                    num_edges[length] += 1

        num_entities_seen += group_size

        promile = 1000.0 * num_entities_seen / num_entities
        if promile > last_promile:
            report_entities = 'Processed entities: %d / %d = %.1f%%' % (num_entities_seen, num_entities, promile / 10)
            report_edges = 'Edges: ' + ', '.join(['%.0f: %d' % (l, num_edges[l]) for l in sorted(num_edges.keys())])
            print_progress(report_entities + '; ' + report_edges)
            last_promile = ceil(promile)
    print('')

    print('Number of merged eIDs: %d' % (num_merged))

    # Construct parallel lists of IDs and eIDs
    IDs_list, eIDs_list = zip(*[(ID, eIDs[ID]) for ID in sorted(eIDs.keys()) if ID != eIDs[ID]])
    '''
    # (TEMP) Print the lists to a file
    file_output_merge = '/tmp/output/merge.txt'
    with open(file_output_merge, 'w') as f:
        for ID, eID in zip(IDs_list, eIDs_list):
            f.write('%d | %d\n' % (ID, eID))
            #print('%d | %d' % (ID, eID))

    # (TEMP) Print the edges to a file
    file_output_edges = '/tmp/output/edges.txt'
    with open(file_output_edges, 'w') as f:
        for ID1, name1, ID2, name2, length in edges:
            f.write('Add edge of length %.2f between:\n' % (length))
            f.write('    %d | %s\n' % (ID1, name1.encode('utf-8')))
            f.write('    %d | %s\n' % (ID2, name2.encode('utf-8')))
    '''
    return IDs_list, eIDs_list, edges

def consolidate_companies():
    # Connect to database
    log("Merging companies.")
    log("Connecting to the database")
    with open("utils/db_config.yaml", "r") as stream:
        config = yaml.load(stream)

    db = psycopg2.connect(user=config["user"], dbname=config["db"])
    cur = db.cursor(cursor_factory=psycopg2.extras.DictCursor)
    cur.execute("SET search_path = 'mysql'")

    sql = "((SELECT ico, id FROM firmy_data WHERE (ico > 10000) and id IS NOT NULL) union " \
        + "(SELECT ico, id FROM new_orsr_data WHERE (ico > 10000) and id IS NOT NULL) union " \
        + "(SELECT ico, id FROM orsresd_data WHERE (ico > 10000) and id IS NOT NULL)) ORDER BY ico LIMIT %s"
    cur.execute(sql, [int(config["relations_to_load"])])
    ids = []
    eids = []
    last_ico = -1
    last_eid = -1
    for row in cur:
        current_eid = row["id"]
        current_ico = row["ico"]
        if (last_ico == current_ico):
            ids.append(current_eid)
            eids.append(last_eid);
            current_eid = last_eid
        last_ico = current_ico
        last_eid = current_eid

    cur.close()
    db.close()
    log("DONE consolidate companies")
    return ids, eids

def update_eids_of_ids(cur, ids, eids):
    print "Updating eids", len(ids), len(eids)
    sql = "UPDATE entities set eid = %s where id = %s"
    cur.executemany(sql, zip(eids, ids))

def add_neighbour_edges(cur, edges):
    print "Adding neighbour edges", len(edges) 
    sql = "INSERT INTO related (eid1, id1, eid2, id2, source, length) VALUES(%s, %s, %s, %s, %s, %s)"
    cur.executemany(sql, ((id1, id1, id2, id2, 'neighbour', l) for (id1, id2, l) in edges))

def consolidate_entities(read_only):
    ids1, eids1, edges = consolidate_people()
    ids2, eids2 = consolidate_companies()
    if read_only:
        return

    with open("utils/db_config.yaml", "r") as stream:
        config = yaml.load(stream)
    db = psycopg2.connect(user=config["user"], dbname=config["db"])
    cur = db.cursor(cursor_factory=psycopg2.extras.DictCursor)
    cur.execute("SET search_path = 'mysql'")
    # 1. Reset eids to be equal to ids in entities.
    print "Reset eids"
    cur.execute("update entities set eid = id;")
    # 2. Consolidate people
    print "Update DB with people eids"
    update_eids_of_ids(cur, ids1, eids1)
    # 3. Consolidate companies
    print "Update DB with companies eids"
    update_eids_of_ids(cur, ids2, eids2)
    # 4. Remove neighbour edges
    print "Delete neighbour edges"
    cur.execute("DELETE from related where source=%s", ("neighbour",))
    # 5. Add new neighbour edges 
    add_neighbour_edges(cur, edges)
    # 6. Update related table
    print "Updating related eids"
    cur.execute("UPDATE related SET eid1=entities.eid FROM entities WHERE related.id1=entities.id;")
    cur.execute("UPDATE related SET eid2=entities.eid FROM entities WHERE related.id2=entities.id;")
    cur.close()
    db.commit()
    db.close()

if __name__ == '__main__':
    consolidate_entities(False)

