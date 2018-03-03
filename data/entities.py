import codecs

# Maps used to remember the current state.
# They can be empty, or loaded with data from database.
address2eid = {}
eid2name = {}
ico2eid = {}
# TODO: Delete usage of X
X = 1
surnames = {}
titles = []

def log(s):
    print "LOG: " + s

def read_surnames():
    """ Reads in a list of surnames from the provided data file """
    file_surnames = 'data_surnames.txt'
    with codecs.open(file_surnames, 'r') as f:
        surnames = set([line.strip().decode('utf-8') for line in f.readlines()])
    return surnames

def read_titles():
    """ Reads in a list of academic titles from the provided data file """
    file_titles = 'data_titles.txt'
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


def is_merge_desired(plain_name1, plain_name2):
    """ Input:
        plain_names: plain string names, which needs to be parsed by 
                     parse_entity_name
        Output:
        True iff the two names have equal surnames and
            last first names are equal.
    """
    if plain_name1 == plain_name2:
      return True
    name1 = parse_entity_name(plain_name1, surnames, titles)
    name2 = parse_entity_name(plain_name2, surnames, titles)
    
    if (name1 is None) or (name2 is None):
        return False
    if (name1['surname'] != name2['surname']):
        return False

    fns1 = name1['firstnames']
    fns2 = name2['firstnames']
    # Transitive relation: last first names match
    return fns1[-1] == fns2[-1]

def ExistsICO(ico):
  if ico in ico2eid:
    return ico2eid[ico]
  return -1

def ExistsPerson(name, address_id):
  if not address_id in address2eid:
    return -1 
  for candidate in address2eid[address_id]:
    print 'candidate:',candidate,eid2name[candidate]
    if is_merge_desired(name, eid2name[candidate]):
      return candidate
  return -1
  
def AddICO(eid, ico):
  # TODO: Add to database
  ico2eid[ico] = eid  
  
def AddNewEntity(ico, name, address_id):
  print 'New Entity added to table', name, address_id
  global X
  X = X + 1
  # TODO: Add to database and get new X from DB
  if ico is None:
    eid2name[X] = name
    if address_id in address2eid:
      address2eid[address_id].append(X)
    else:
      address2eid[address_id] = [X]
  else:  
    AddICO(X, ico)
  return X
  
def GetEntity(ico, name, address_id):
  eid = None
  if ico is None:
    # Ak je to osoba
    eid = ExistsPerson(name, address_id)    
    # Ak sme osobu nasli tak ju vratime
    if eid >= 0:
      return eid
    else:
      eid = AddNewEntity(ico, name, address_id)
      return eid
  else:  
    # Ak je to firma
    eid = ExistsICO(ico)
    # Ak sme ICO nasli tak ho vratime
    if eid >= 0:
      return eid
    else:
      eid = AddNewEntity(ico, name, address_id)
      return eid

def main():
  print '$',GetEntity(123456, 'Rasto Inc.', 77)
  print '$',GetEntity(123456, 'Rasto Inc. 2', 77)
  print '$',GetEntity(None, 'Rasto L', 77)
  print '$',GetEntity(None, 'Rasto L', 77)
  print '$',GetEntity(None, 'MUDr Rasto L', 77)
  surnames = read_surnames()
  titles = read_titles()
  
if __name__ == '__main__':
  main()
