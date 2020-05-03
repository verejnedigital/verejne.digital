"""Adds edges between family members at the same address."""

import six

from . import entity_tools
from . import graph_tools
from . import utils

# Edges between neighbours are added only if the number of entities
# at a particular address is at most `MAX_NEIGHBOUR_GROUP_SIZE`:
MAX_NEIGHBOUR_GROUP_SIZE = 2

# String to prefix log messages with:
LOG_PREFIX = '[post_process_neighbours] '


def _are_surnames_similar(surname1, surname2):
    """Decides if two surnames are similar enough to be family."""

    if (not surname1) or (not surname2):
        return False

    # TODO(matejbalog): Consider normalising by removing accents and
    # capitalisation.

    if surname1 == surname2:
        return True

    # Decide based on the length of the longest common prefix:
    lcp = utils.longest_common_prefix(surname1, surname2)
    if (lcp >= 3 and lcp >= len(surname1) - 3 and
            lcp >= len(surname2) - 1 and surname1[-1] in ['a', '\xe1']):
        return True
    if (lcp >= 3 and lcp >= len(surname1) - 1 and
            lcp >= len(surname2) - 3 and surname2[-1] in ['a', '\xe1']):
        return True

    return False


def add_family_and_neighbour_edges(db, test_mode):
    """Adds edges between family members and close neighbours.

    Creates two new edge types and adds the corresponding edges:
    (1) "family": Links any two entities at the same address with
        "sufficiently" similar surnames (as determined by the function
        `_are_surnames_similar` above).
    (2) "neighbours": Links any two entities at the same address, as
        long as there are at most MAX_NEIGHBOUR_GROUP_SIZE entities at
        that address.
    """

    # Load surnames and academic titles:
    surnames = entity_tools.get_surnames()
    titles_parser = entity_tools.get_academic_titles_parser()

    # Compute mapping from eids to parsed entity names:
    parsed_name = {}
    suffix = ' LIMIT 50000;' if test_mode else ';'
    query = 'SELECT id, name FROM entities' + suffix
    with db.get_server_side_cursor(query) as cur:
        for eid, name in cur:
            parsed = entity_tools.parse_entity_name(
                name, titles_parser, surnames, verbose=False)
            if parsed:
                parsed_name[eid] = parsed

    # Initialise edges:
    edges_family = []
    edges_neighbours = []

    # Iterate through entity groups sharing the same Address:
    suffix = " LIMIT 50000;" if test_mode else ";"
    cur = db.get_server_side_cursor("""
        SELECT array_agg(id) as eids
        FROM entities
        GROUP BY address_id
        """ + suffix, buffer_size=10000)

    # Iterate through entity groups sharing the same Address:
    for row in cur:
        eids = row[0]

        # Iterate through distinct pairs of entities in this group:
        group_size = len(eids)
        for i in six.moves.range(group_size):
            # Add family edges:
            if eids[i] in parsed_name:
                for j in six.moves.range(i + 1, group_size):
                    if eids[j] in parsed_name:
                        if _are_surnames_similar(
                                parsed_name[eids[i]].surname,
                                parsed_name[eids[j]].surname):
                            edges_family.append((eids[i], eids[j]))
                            edges_family.append((eids[j], eids[i]))

            # Add neighbour edges:
            if group_size <= MAX_NEIGHBOUR_GROUP_SIZE:
                for j in range(i + 1, group_size):
                    edges_neighbours.append((eids[i], eids[j]))
                    edges_neighbours.append((eids[j], eids[i]))

    cur.close()
    print('%sAccumulated %d family edges and %d neighbour edges' % (LOG_PREFIX, len(edges_family), len(edges_neighbours)))

    # Get edge type indices for the new edge types:
    edge_type_family = graph_tools.add_or_get_edge_type(
        db, "Zhoda v priezvisku a adrese", LOG_PREFIX)
    edge_type_neighbour = graph_tools.add_or_get_edge_type(
        db, "Susedia", LOG_PREFIX)

    # Remove any existing edges of these edge types:
    q_data = [edge_type_family, edge_type_neighbour]
    db.execute("""
        DELETE FROM related
        WHERE stakeholder_type_id=%s OR stakeholder_type_id=%s;
        """, q_data)
    print("%sRemoved any existing edges of types %s" % (LOG_PREFIX, q_data))

    # Insert the new edges:
    with db.cursor() as cur:
        q = """
        INSERT INTO related(eid, eid_relation, stakeholder_type_id)
        VALUES (%s, %s, %s);
        """
        q_data = [(source, target, edge_type_family)
                  for source, target in edges_family]
        cur.executemany(q, q_data)
        q_data = [(source, target, edge_type_neighbour)
                  for source, target in edges_neighbours]
        cur.executemany(q, q_data)
