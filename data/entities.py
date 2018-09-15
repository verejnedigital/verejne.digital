"""Entities class for maintaining state in prod data generation."""

from prod_generation import entity_tools


class Entities:
  # Maps used to remember the current state.
  # They can be empty, or loaded with data from database.
  address2eid = {}
  eid2name = {}
  ico2eid = {}
  org2eid = {}
  surnames = {}
  titles = []
  db = None
  entities = 0

  def __init__(self, db = None):
      self.db = db
      self.surnames = entity_tools.get_surnames()
      self.titles = entity_tools.get_academic_titles()

  def AddOrg2Eid(self, org_id, eid):
      self.org2eid[org_id] = eid

  def GetEidForOrgId(self, org_id):
      return self.org2eid.get(org_id)

  def is_merge_desired(self, plain_name1, plain_name2):
      """ Input:
          plain_names: plain string names, which needs to be parsed by
                       parse_entity_name
          Output:
          True iff the two names have equal surnames and
              last first names are equal.
      """
      if plain_name1 == plain_name2:
        return True
      name1 = entity_tools.parse_entity_name(
        plain_name1, self.surnames, self.titles)
      name2 = entity_tools.parse_entity_name(
        plain_name2, self.surnames, self.titles)

      if (name1 is None) or (name2 is None):
          return False
      if (name1.surname != name2.surname):
          return False

      fns1 = name1.firstnames
      fns2 = name2.firstnames
      # Transitive relation: last first names match
      return fns1[-1] == fns2[-1]

  def ExistsICO(self, ico):
    if ico in self.ico2eid:
      return self.ico2eid[ico]
    return -1

  def ExistsPerson(self, name, address_id):
    if not address_id in self.address2eid:
      return -1
    for candidate in self.address2eid[address_id]:
      if self.is_merge_desired(name, self.eid2name[candidate]):
        return candidate
    return -1

  def AddICO(self, eid, ico):
    self.ico2eid[ico] = eid

  def AddNewEntity(self, ico, name, address_id):
    self.entities += 1
    if address_id is None:
        return None
    if not self.db is None:
      eid = self.db.add_values("Entities", [name, address_id])
    else:
      eid = self.entities
    self.eid2name[eid] = name
    if address_id in self.address2eid:
      self.address2eid[address_id].append(eid)
    else:
      self.address2eid[address_id] = [eid]
    if not ico is None:
      self.AddICO(eid, ico)
    return eid

  def GetEntity(self, ico, name, address_id):
    eid = None
    if not ico is None:
      # Skontrolujme ci je ICO int!
      if not isinstance(ico, (int, long)):
        raise ValueError('ICO must be an integer')
      # Ak je to firma
      eid = self.ExistsICO(ico)
      # Ak sme ICO nasli tak ho vratime
      if eid >= 0:
        return eid
    # self.Ak je to osoba
    eid = self.ExistsPerson(name, address_id)
    # Ak sme osobu nasli tak ju vratime
    if eid >= 0:
      # v pripade ze sme nasli match na osobu o ktorej sme predtym nevedeli
      # ale uz vieme ico, tak si ho zapamatame
      if not ico is None:
        self.AddICO(eid, ico)
      return eid
    else:
      eid = self.AddNewEntity(ico, name, address_id)
      return eid


if __name__ == '__main__':
    e = Entities()
    print '$',e.GetEntity(123456, 'Rasto Inc.', 77)
    print '$',e.GetEntity(123456, 'Rasto Inc. 2', 77)
    print '$',e.GetEntity(None, 'Richard Fico', 77)
    print '$',e.GetEntity(None, 'Richard Fico', 77)
    print '$',e.GetEntity(None, 'MUDr Richard Fico', 77)
    print '$',e.GetEntity(None, 'MUDr Richard Fico - zmrzlina', 77)
    print '$',e.GetEntity(241, 'Arnold Novak - zmrzlina', 77)
    print '$',e.GetEntity(None, 'Arnold Novak', 77)
    print '$',e.GetEntity(None, 'Beta Novakova', 77)
    print '$',e.GetEntity(416, 'Ing. Beta Novakova', 77)
    print '$',e.GetEntity(416, 'Ing. Beta Novakova Csc.', 87)
