# -*- coding: utf-8 -*-
# Class to transform address -> address_id. The class takes care of caching and
# address normalization (e.g lowercase, remove 'Slovensko',...)
class Geocoder:
    cache_table = None

    cache = {}
    cache_miss = 0
    cache_hit = 0


    def __init__(self, db, db_address_id, cache_table):
        self.cache_table = cache_table
        self.db = db
        self.db_address_id = db_address_id
        self.cache_table = cache_table
        # matches NUM/NUMx where x is either space (' ') or command followed by
        # space (', ')
        self.prog = re.compile(" ([0-9]+)\/([0-9]+)( |(, ))")
        # Match psc, either XXXXX or XXX XX.
        self.psc = re.compile("[0-9][0-9][0-9](([0-9][0-9])|( [0-9][0-9]))")

        with self.db.dict_cursor() as cur:
            # TODO: change this to read more addresses.
            cur.execute(
                    "SELECT address, original_address, lat, lng FROM " + cache_table +
                    " LIMIT 10000",
            )
            for row in cur:
                # Create cache of all normalizations -> lat, lng. We notmalize both the
                # given and the geocoded address
                keys = set(
                        self.GetKeysForAddress(row["address"].encode("utf8")) +
                        self.GetKeysForAddress(row["original_address"].encode("utf8"))
                )
                # TODO: save memory by storing lat, lng, address only once and reusing
                # it between instances
                for key in keys:
                    self.cache[key] = row["lat"], row["lng"], row["address"]
                if (len(self.cache) < 10):
                    print row["original_address"].encode("utf8")
                    print row["address"].encode("utf8")
                    print self.cache.keys()


    def NormalizeAddress(self, address):
        """ Simple syntactic normalization of an address."""
        return address.lower().strip()


    def GetKeysForAddress(self, address):
        """ Generates all possible keys an address can match to.
        For example removes slovenska republika from the end, simplifies PSC,
        removes A/B, etc
        """
        # Drop the first number in NUM/NUM in address. E.g, Hlavna Ulica 123/45
        # Here and below, the input is the set of keys. The function returns the
        # keys after applying the transformation (if possible).
        def ExpandKeysRemoveSlash(keys):
            result = []
            for k in keys:
                obj = re.search(self.prog, k)
                if obj:
                    new_k = k.replace(obj.group(0), " " + obj.group(2) + " ")
                    if (len(new_k) > 5): result.append(new_k)
            return result

        # Remove PSC
        def ExpandKeysRemovePSC(keys):
            result = []
            for k in keys:
                obj = re.search(self.psc, k)
                if obj:
                    new_k = k.replace(obj.group(0), "")
                    if (len(new_k) > 5): normalized.append(new_k)
            return result

        # Remove common suffixes not adding any value
        def ExpandKeysRemoveSuffixes(keys):
            drop_patterns = [
                    'Slovenská republika',
                    'Slovensko',
                    'Slovakia',
                    'Slovak Republic'
            ]
            drop_patterns = [
                    self.NormalizeAddress(pattern) for pattern in drop_patterns
            ]
            result = []
            for pattern in drop_patterns:
                for k in keys:
                    if pattern in k:
                        without = k.replace(pattern, "")
                        if (len(without) > 5): result.append(without)
            return result

        normalized = [self.NormalizeAddress(address)]
        normalized += ExpandKeysRemoveSlash(normalized)
        normalized += ExpandKeysRemovePSC(normalized)
        normalized += ExpandKeysRemoveSuffixes(normalized)
        return [self.NormalizeAddress(res.replace(" ", "").replace(",", ""))
                for res in set(normalized)]


    def GetAddressId(self, address):
        """ Get AddressId for a given string. If the address is not in the cache
        returns None and writes address into the list of address to be processed.
        """
        #print "Geocoding", address
        for key in self.GetKeysForAddress(address):
            if not key in self.cache:
                #TODO: insert into table to process later
                self.cache_miss += 1
                continue
            self.cache_hit += 1
            lat, lng, formatted_address = self.cache[key]
            print address, " -> ", lat, lng, formatted_address
            with self.db_address_id.dict_cursor() as cur_id:
                cur_id.execute(
                        "SELECT id FROM Addresses WHERE lat=%s and lng=%s",
                        [lat, lng]
                )
                row_id = cur_id.fetchone()
                if (row_id is None):
                    return self.db_address_id.add_values(
                            "Addresses", [lat, lng, formatted_address])
                return row_id["id"]

        return None
