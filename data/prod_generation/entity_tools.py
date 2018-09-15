"""Utility methods for handling Entities.

These methods can be shared between entity generation (invoked through
the Entities class) at the start of prod data generation, and between
post processing methods (such as adding edges between family members
and neighbours).
"""

import codecs
import collections
import six


def get_surnames():
  """Retrieves a set of surnames from a provided data file."""
  path_surnames = 'prod_generation/surnames.txt'
  with codecs.open(path_surnames, 'r') as f:
    return set(line.strip().decode('utf-8') for line in f.readlines())


def get_academic_titles():
  """Retrieves a set of academic titles from a provided data file."""
  path_titles = 'prod_generation/academic_titles.txt'
  with codecs.open(path_titles, 'r') as f:
    return set(line.strip().decode('utf-8') for line in f.readlines())


# NamedTuple for parsed entity names:
# - `titles_pre` is a list of academic titles detected before the name
# - `firstnames` is a non-empty list of given names
# - `surname` is a string
# - `titles_suf` is a list of academic titles detected after the name
ParsedName = collections.namedtuple(
    "ParsedName",
    ["titles_prefix", "firstnames", "surname", "titles_suffix"]
)


# TODO(matejbalog): Check equivalence with the version in entities.py.
def parse_entity_name(entity_name, surnames, titles, verbose=False):
  """Parses an entity name into a ParsedName, or returns None."""

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
