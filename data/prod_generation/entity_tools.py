"""Utility methods for handling Entities.

These methods can be shared between entity generation (invoked through
the Entities class) at the start of prod data generation, and between
post processing methods (such as adding edges between family members
and neighbours).
"""

import codecs
import collections
import re


def get_surnames():
    """Retrieves a set of surnames from a provided data file."""
    path_surnames = 'prod_generation/surnames.txt'
    with codecs.open(path_surnames, 'r') as f:
        return set(line.strip().lower() for line in f.readlines())


def get_academic_titles_parser():
    """Returns a regular expression for parsing academic titles."""

    # Read list of academic titles from the data file.
    path_titles = 'prod_generation/academic_titles.txt'
    with codecs.open(path_titles, 'r') as f:
        titles = set(line.strip() for line in f.readlines())

    # Compile the regular expression.
    re_titles = "|".join(titles)
    re_name = ("^(?P<titles_pre>((%s)\.?( |,))*)"
               "(?P<name_clean>.*?)"
               "(?P<titles_suffix>(( |,)*(%s)\.?)*)$" % (
                   re_titles, re_titles))
    return re.compile(re_name)


# NamedTuple for parsed entity names:
# - `titles_pre` is a string of academic titles detected before name
# - `firstnames` is a non-empty list of given names
# - `surname` is a string
# - `titles_suf` is a string of academic titles detected after name
ParsedName = collections.namedtuple(
    "ParsedName",
    ["titles_prefix", "firstnames", "surname", "titles_suffix"]
)


def parse_entity_name(entity_name, titles_parser, surnames,
                      verbose=False):
    """Parses an entity name into a ParsedName, or returns None."""

    if verbose:
        print('entity_name = |%s|' % (entity_name))

    # Remove newlines from `entity_name`:
    entity_name = entity_name.replace("\n", " ")

    # Trim name of Zivnost, followed by first occurrence of (' - ').
    p = entity_name.find(' - ')
    if (p > 0):
        name = entity_name[:p]
    else:
        name = entity_name
    if verbose:
        print('name = |%s|' % (name))

    # Trim academic titles from the start and end of the name.
    match = titles_parser.match(name).groupdict()
    titles_pre = match['titles_pre'] if 'titles_pre' in match else ''
    titles_suf = match['titles_suf'] if 'titles_suf' in match else ''
    name_clean = match['name_clean']
    if verbose:
        print('name_clean = |%s|' % (name_clean))

    # Split cleaned name on spaces (it should now be a list of
    # firstnames, followed by a surname).
    names = name_clean.split()

    # Lowercase the names, so that we get case-insensitive matching on
    # both surnames and firstnames downstream.
    names = [name.lower() for name in names]

    # Strict matching: Check that last name is a surname
    # if len(names) >= 2 and names[-1] in surnames:
    #   return {
    #       'titles_pre': titles_pre,
    #       'firstnames': names[:-1],
    #       'surname': names[-1],
    #       'titles_suf': titles_suf,
    #   }

    # Less conservative matching: Find the last token that is a surname,
    # and take the rest before it as given names
    i = len(names) - 1
    while (i >= 1) and (names[i] not in surnames):
        i -= 1
    if i >= 1:
        return ParsedName(
            titles_prefix=titles_pre,
            firstnames=names[:i],
            surname=names[i],
            titles_suffix=titles_suf
        )
    else:
        if verbose:
            print('Parse failed')
        return None
