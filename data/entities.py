"""Entities class for maintaining state in prod data generation."""

from prod_generation import entity_tools


class Entities:
    # Maps used to remember the current state.
    # They can be empty, or loaded with data from database.
    address2eid = {}
    eid2name = {}
    eid_to_parsed_name = {}
    ico2eid = {}
    org2eid = {}
    surnames = {}
    titles = []
    db = None
    entities = 0

    def __init__(self, db=None):
        self.db = db
        self.surnames = entity_tools.get_surnames()
        self.titles_parser = entity_tools.get_academic_titles_parser()

    def AddOrg2Eid(self, org_id, eid):
        self.org2eid[org_id] = eid

    def GetEidForOrgId(self, org_id):
        return self.org2eid.get(org_id)

    def is_merge_desired(
            self, plain_name1, parsed_name1, plain_name2, parsed_name2):
        """Determines if two entities should be merged into one.

        Args:
          plain_name1: A string; unparsed name of entity 1.
          parsed_name1: An entity_tools.ParsedName of entity 1.
          plain_name2: A string; unparsed name of entity 2.
          parsed_name2: An entity_tools.ParsedName of entity 2.
        Returns:
          True iff the two names have equal surnames and their last
          firstnames also match. Note this is a transitive relation.
        """
        if plain_name1 == plain_name2:
            return True

        if (parsed_name1 is None) or (parsed_name2 is None):
            return False
        if (parsed_name1.surname != parsed_name2.surname):
            return False

        fns1 = parsed_name1.firstnames
        fns2 = parsed_name2.firstnames
        return fns1[-1] == fns2[-1]

    def ExistsICO(self, ico):
        if ico in self.ico2eid:
            return self.ico2eid[ico]
        return -1

    def ExistsPerson(self, name, parsed_name, address_id):
        if not address_id in self.address2eid:
            return -1
        for candidate in self.address2eid[address_id]:
            if self.is_merge_desired(
                    name,
                    parsed_name,
                    self.eid2name[candidate],
                    self.eid_to_parsed_name[candidate]
            ):
                return candidate
        return -1

    def AddICO(self, eid, ico):
        self.ico2eid[ico] = eid

    def AddNewEntity(self, ico, name, parsed_name, address_id):
        self.entities += 1
        if address_id is None:
            return None
        if not self.db is None:
            eid = self.db.add_values("Entities", [name, address_id])
        else:
            eid = self.entities
        self.eid2name[eid] = name
        self.eid_to_parsed_name[eid] = parsed_name
        if address_id in self.address2eid:
            self.address2eid[address_id].append(eid)
        else:
            self.address2eid[address_id] = [eid]
        if not ico is None:
            self.AddICO(eid, ico)
        return eid

    def GetEntity(self, ico, name, address_id, no_new_entity=False):
        eid = None
        if not ico is None:
            # Skontrolujme ci je ICO int!
            if not isinstance(ico, int):
                raise ValueError('ICO must be an integer')
            # Ak je to firma
            eid = self.ExistsICO(ico)
            # Ak sme ICO nasli tak ho vratime
            if eid >= 0:
                return eid
        # self.Ak je to osoba
        parsed_name = entity_tools.parse_entity_name(
            name, self.titles_parser, self.surnames)
        eid = self.ExistsPerson(name, parsed_name, address_id)
        # Ak sme osobu nasli tak ju vratime
        if eid >= 0:
            # v pripade ze sme nasli match na osobu o ktorej sme predtym nevedeli
            # ale uz vieme ico, tak si ho zapamatame
            if not ico is None:
                self.AddICO(eid, ico)
            return eid
        elif no_new_entity:
            return None
        else:
            eid = self.AddNewEntity(ico, name, parsed_name, address_id)
            return eid

    def print_statistics(self):
        """Prints current values of accumulated statistics to stdout."""

        statistics = {
            "# entities": len(self.eid2name),
            "# icos mapped to eids": len(self.ico2eid),
            "# organization ids mapped to eids": len(self.org2eid),
        }
        for statistic_name in statistics:
            print("%s: %d" % (statistic_name, statistics[statistic_name]))


if __name__ == '__main__':
    e = Entities()
    print('$', e.GetEntity(123456, 'Rasto Inc.', 77))
    print('$', e.GetEntity(123456, 'Rasto Inc. 2', 77))
    print('$', e.GetEntity(None, 'Richard Fico', 77))
    print('$', e.GetEntity(None, 'Richard Fico', 77))
    print('$', e.GetEntity(None, 'MUDr Richard Fico', 77))
    print('$', e.GetEntity(None, 'MUDr Richard Fico - zmrzlina', 77))
    print('$', e.GetEntity(241, 'Arnold Novak - zmrzlina', 77))
    print('$', e.GetEntity(None, 'Arnold Novak', 77))
    print('$', e.GetEntity(None, 'Beta Novakova', 77))
    print('$', e.GetEntity(416, 'Ing. Beta Novakova', 77))
    print('$', e.GetEntity(416, 'Ing. Beta Novakova Csc.', 87))
