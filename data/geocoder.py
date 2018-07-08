# -*- coding: utf-8 -*-
import itertools
import json
import re
import urllib
import yaml

# Class to transform address -> address_id. The class takes care of caching and
# address normalization (e.g lowercase, remove 'Slovensko',...)
class Geocoder:
    db_address_cache = None
    db_address_id = None
    cache = {}
    cache_miss = 0
    cache_hit = 0
    api_lookups = 0
    api_lookup_fails = 0
    geocode_key = None
    test_mode = False

    def __init__(self, db_address_cache, db_address_id, test_mode):
        self.db_address_cache = db_address_cache
        self.db_address_id = db_address_id
        self.test_mode = test_mode
        # Read API key for geocoding lookups.
        with open("/tmp/geocode_key.txt", 'r') as f:
            self.geocode_key = yaml.load(f)['key']

        # matches NUM/NUMx where x is either space (' ') or command followed by
        # space (', ')
        self.prog = re.compile(" ([0-9]+)\/([0-9]+)( |(, ))")
        # Match psc, either XXXXX or XXX XX.
        self.psc = re.compile("[0-9][0-9][0-9](([0-9][0-9])|( [0-9][0-9]))")
        # Match Bratislava/Kosice - xxx
        self.city_part = re.compile("(bratislava|košice) ?-(.*)")

        with db_address_cache.dict_cursor() as cur:
            print "Reading cache of geocoded addresses"
            suffix_for_testing = ""
            if self.test_mode:
                suffix_for_testing = " LIMIT 200000"
            cur.execute(
                    "SELECT address, formatted_address, lat, lng FROM Cache " +
                    suffix_for_testing,
            )
            print "Geocoder cache ready"
            for row in cur:
                self.AddToCache(
                        row["address"].encode("utf8"),
                        row["formatted_address"].encode("utf8"), 
                        row["lat"], row["lng"]
                )
            print "Finished pre-processing geocoder input cache"


    def AddToCache(self, address, formatted_address, lat, lng):
        " Add one entry to the cache. The function takes care of generating proper keys"
        keys = set(
                list(self.GetKeysForAddress(address)) +
                list(self.GetKeysForAddress(formatted_address))
        )
        # TODO: save memory by storing lat, lng, address only once and reusing
        # it between instances
        for key in keys:
            self.cache[key] = (lat, lng, formatted_address)
        if (len(self.cache) < 10):
            print address, formatted_address, lat, lng
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
                    if (len(new_k) > 5): result.append(new_k)
            return result

        # Remove common suffixes not adding any value
        def ExpandKeysRemoveSuffixes(keys):
            drop_patterns = [
                    'slovenská republika',
                    'slovenska republika',
                    'slovensko',
                    'slovakia',
                    'slovak republic'
            ]
            result = []
            for pattern in drop_patterns:
                for k in keys:
                    if pattern in k:
                        without = k.replace(pattern, "")
                        if (len(without) > 5): result.append(without)
            return result

        # Drop xxx in Bratislava - xxx
        def ExpandKeysRemoveCityPart(keys):
            result = []
            for k in keys:
                obj = re.search(self.city_part, k)
                if obj:
                    new_k = k.replace(obj.group(2), "")
                    if (len(new_k) > 5): result.append(new_k)
            return result

        # Return generator that returns set(concat(seq, map(f, seq)))
        # evaluating everything only once
        def MapConcatGenerator(seq, f):
            computed = []
            outputed = set()
            for s in seq:
                if s in outputed: continue
                yield s
                outputed.add(s)
                computed.append(s)
            values = f(computed)
            for value in values:
                if value in outputed: continue
                yield value
                outputed.add(value)

        # Returns just [address] so can be used consistently with the above methods.
        def Identity(keys):
            return [self.NormalizeAddress(address)]

        functions = [
                Identity,
                ExpandKeysRemoveSlash,
                ExpandKeysRemovePSC,
                ExpandKeysRemoveSuffixes,
                ExpandKeysRemoveCityPart
        ]
        old = []
        already = set()
        # Apply the defined transformations one-by-one and yield any new
        # key obtained
        for f in functions:
            new = f(old)
            for res in new:
                if res in already: continue
                already.add(res)
                yield res.replace(" ", "").replace(",", "").replace("-", "")
            old += new


    def GeocodingAPILookup(self, address):
        " Performs and returns the response from Google geocoding api."
        # Don't try to do any geocoding at the moment as we have plenty of things
        # in the cache. Now we're mostly geocoding things where geocoding failed
        # before. Remove this once started handling failed geocoding requests properly.
        return None
        self.api_lookups += 1
        if (self.api_lookups > 100000):
            # The API has daily limit of 100k queries, so save some round trips
            # and fail early.
            return None
        if self.test_mode and (self.api_lookups > 10): return None
        params = {
            'address': address,
            'region': 'sk',
            'key': self.geocode_key
        }
        url = (
            "https://maps.googleapis.com/maps/api/geocode/json?" +
            urllib.urlencode(params)
        )
        try:
            response = urllib.urlopen(url)
            return json.loads(response.read())
        except:
            return None


    def UpdateGeocodingAPILookup(self, address):
        """ Lookup address in the geocoding api and update cache with the result.
        """
        api_response = self.GeocodingAPILookup(address)
        if (api_response is None) or (api_response["status"] != "OK"):
            # API did not succeed
            self.api_lookup_fails += 1
            if not self.test_mode:
                # Store into the list for later processing.
                self.db_address_cache.add_values("ToProcess", [address])
                self.db_address_cache.commit()
            return
        result = api_response["results"][0]
        lat = result["geometry"]["location"]["lat"]
        lng = result["geometry"]["location"]["lng"]
        formatted_address = result["formatted_address"].encode("utf8")
        # Add to cache and add to the database
        self.AddToCache(address, formatted_address, lat, lng)
        self.db_address_cache.add_values(
            "Cache",
            [address, formatted_address, lat, lng, json.dumps(api_response["results"])]
        )
        self.db_address_cache.commit()


    def GetAddressId(self, address):
        """ Get AddressId for a given string. If the address is not in the cache
        returns None and writes address into the list of address to be processed.
        """
        #print "Geocoding", address
        def LookupKeysInCache(keys):
            """ Check whether some key is in the cache. If so, return the
            Address.id for the matching lat, lng. If no entry in Address
            exists with the matching lat, lng, create one.
            """
            for key in keys:
                if not key in self.cache:
                    self.cache_miss += 1
                    continue
                self.cache_hit += 1
                lat, lng, formatted_address = self.cache[key]
                # print address, " -> ", lat, lng, formatted_address
                with self.db_address_id.dict_cursor() as cur_id:
                    cur_id.execute(
                            "SELECT id FROM Address WHERE lat=%s and lng=%s",
                            [lat, lng]
                    )
                    row_id = cur_id.fetchone()
                    if (row_id is None):
                        return self.db_address_id.add_values(
                                "Address", [lat, lng, formatted_address])
                    return row_id["id"]
            return None

        keys, keys_backup = itertools.tee(self.GetKeysForAddress(address))
        address_id = LookupKeysInCache(keys)
        if address_id is not None: return address_id
        # Did not find address id, do geocoding lookup, which add data into cache.
        self.UpdateGeocodingAPILookup(address)
        return LookupKeysInCache(keys_backup)

    
    def PrintStats(self):
        print "CACHE_HITS", self.cache_hit
        print "CACHE_MISS", self.cache_miss
        print "API_LOOKUPS", self.api_lookups
        print "API_LOOKUP_FAILS", self.api_lookup_fails
