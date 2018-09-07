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
    cache_key_hints = {}
    formatted_address_to_lat_lng = {}
    cache_miss = 0
    cache_hit = 0
    api_lookups = 0
    api_lookup_fails = 0
    missing_key_hint = 0
    has_key_hint = 0
    adjust_point = 0
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

        suffix_for_testing = ""
        if self.test_mode: suffix_for_testing = " LIMIT 200000"
        with db_address_cache.dict_cursor() as cur:
            print "Reading cache of geocoded addresses"
            cur.execute(
                    "SELECT address, formatted_address, lat, lng FROM Cache " +
                    suffix_for_testing,
            )
            print "Processing database output"
            for row in cur:
                self.AddToCache(
                        row["address"].encode("utf8"),
                        row["formatted_address"].encode("utf8"), 
                        row["lat"], row["lng"], update_formatted_address=True
                )
            print "Finished pre-processing geocoder input cache, size =", len(self.cache)

        with self.db_address_cache.dict_cursor() as cur:
            print "KeyHints cache"
            cur.execute(
                    "SELECT address, key_hint FROM AddressHints" +
                    suffix_for_testing
            )
            print "Processing database output"
            for row in cur:
                self.cache_key_hints[row["address"].encode("utf8")] = row["key_hint"].encode("utf8")
            print "Finished reading key hints, size =", len(self.cache_key_hints)
 

    def AddToCache(self, address, formatted_address, lat, lng, update_formatted_address):
        " Add one entry to the cache. The function takes care of generating proper keys"
        keys = set(
                list(self.GetKeysForAddress(address)) +
                list(self.GetKeysForAddress(formatted_address))
        )
        # TODO: save memory by storing lat, lng, address only once and reusing
        # it between instances
        for key in keys:
            self.cache[key] = (lat, lng, formatted_address)
        if update_formatted_address:
            self.formatted_address_to_lat_lng[formatted_address] = (lat, lng)
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
                old.append(res)
                yield res.replace(" ", "").replace(",", "").replace("-", "")


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
        self.AddToCache(address, formatted_address, lat, lng, update_formatted_address=False)
        self.db_address_cache.add_values(
            "Cache",
            [address, formatted_address, lat, lng, json.dumps(api_response["results"])]
        )
        self.db_address_cache.commit()


    def GetAddressId(self, address):
        """ Get AddressId for a given string. If the address is not in the cache
        returns None and writes address into the list of address to be processed.
        """


        def GetAddressDataForKey(key):
            """ For a given key, lookups lat, lng, formatted address in the caches.
            Returns None if missing, otherwise returns (lat, lng, formatted_address).
            """
            if not key in self.cache:
                self.cache_miss += 1
                return None
            self.cache_hit += 1
            lat, lng, formatted_address = self.cache[key]
            # If we have a different (lat, lng) mapping to the same formatted address
            # which is very close, use that one instead. This helps if geocoding output
            # changes slightly to merge different points to the same AddressID.
            if formatted_address in self.formatted_address_to_lat_lng:
                new_lat, new_lng = self.formatted_address_to_lat_lng[formatted_address]
                if abs(new_lat - lat) < 0.01 and abs(new_lng - lng) < 0.01:
                    if lat != new_lat or lng != new_lng:
                        self.adjust_point += 1
                        if self.adjust_point < 10:
                            print "Adjust point", lat, lng, new_lat, new_lng, formatted_address
                    lat = new_lat
                    lng = new_lng
            return lat, lng, formatted_address

        def LookupKeysInCache(keys):
            """ Check whether some key is in the cache. If so, return the
            (Address.id, matching_key) for the matching lat, lng. If no entry in Address
            exists with the matching lat, lng, create one.
            """
            for key in keys:
                address_data = GetAddressDataForKey(key)
                if address_data is None: continue
                lat, lng, formatted_address = address_data
                # print address, " -> ", lat, lng, formatted_address
                with self.db_address_id.dict_cursor() as cur_id:
                    cur_id.execute(
                            "SELECT id FROM Address WHERE lat=%s and lng=%s",
                            [lat, lng]
                    )
                    row_id = cur_id.fetchone()
                    if (row_id is None):
                        return self.db_address_id.add_values(
                                "Address", [lat, lng, formatted_address]), key
                    return row_id["id"], key
            return None, None

        def UpdateKeyHint(address, key_hint, matched_key):
            # Updates key_hint for a given address with matched_key. Currently, if the
            # old 'key_hint' exists, the new one is ignored.
            if key_hint is not None: return
            if matched_key is None: return
            self.db_address_cache.add_values("AddressHints", [address, matched_key])
            self.cache_key_hints[address] = matched_key

        # Assume anything shorter than 4 characters is not a valid address.
        if len(address) <= 3: return None
        # See if there is a key_hint int the table. If so, add it as the firts key
        # to try the cache lookup on.
        key_hint = self.cache_key_hints.get(address, None)
        key_iterator = self.GetKeysForAddress(address)
        if key_hint is not None:
            key_iterator = itertools.chain([key_hint], key_iterator)
            self.has_key_hint += 1
        else:
            self.missing_key_hint += 1
            if self.test_mode and self.missing_key_hint < 10:
                print "Address without key hint:", address
        keys, keys_backup = itertools.tee(key_iterator)

        address_id, matched_key = LookupKeysInCache(keys)
        if address_id is not None:
            # If the address does not have key_hint, add the matched key
            # into the hints table:
            UpdateKeyHint(address, key_hint, matched_key)
            return address_id
        # Did not find address id, do geocoding lookup, which add data into cache.
        self.UpdateGeocodingAPILookup(address)
        address_id, _ = LookupKeysInCache(keys_backup)
        if address_id is not None: UpdateKeyHint(address, key_hint, matched_key)
        return address_id

    
    def PrintStats(self):
        print "CACHE_HITS", self.cache_hit
        print "CACHE_MISS", self.cache_miss
        print "API_LOOKUPS", self.api_lookups
        print "API_LOOKUP_FAILS", self.api_lookup_fails
        print "HAS KEY HINT", self.has_key_hint
        print "MISSING KEY HINT", self.missing_key_hint
        print "ADJUST POINT", self.adjust_point
