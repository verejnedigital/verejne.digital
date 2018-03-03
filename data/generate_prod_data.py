# -*- coding: utf-8 -*-
import os
import re
import sys

from psycopg2.extensions import AsIs

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../data/db')))
from db import DatabaseConnection

# TODO: move this into a separate file
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
        self.prog = re.compile(" ([0-9]+)\/([0-9]+)( |(, ))")
        self.psc = re.compile("[0-9][0-9][0-9](([0-9][0-9])|( [0-9][0-9]))")

        with self.db.dict_cursor() as cur:
            cur.execute(
                    "SELECT address, original_address, lat, lng FROM " + cache_table +
                    " LIMIT 1000000000",
            )
            for row in cur:
                keys = set(
                        self.GetKeysForAddress(row["address"].encode("utf8")) +
                        self.GetKeysForAddress(row["original_address"].encode("utf8"))
                )
                for key in keys:
                    self.cache[key] = row["lat"], row["lng"], row["address"]
                if (len(self.cache) < 10):
                    print row["original_address"].encode("utf8")
                    print row["address"].encode("utf8")
                    print self.cache.keys()


    def NormalizeAddress(self, address):
        normalized = address.lower().strip()


    def GetKeysForAddress(self, address):
        """ Generates all possible keys an address can match to.

        For example removes slovenska republika from the end, etc
        """
        # Drop the first number in NUM/NUM in address. E.g, Hlavna Ulica 123/45
        def ExpandKeysRemoveSlash(keys):
            result = []
            for k in keys:
                obj = re.search(self.prog, k)
                if obj:
                    new_n = k.replace(obj.group(0), " " + obj.group(2) + " ")
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
        print "Geocoding", address
        for key in self.GetKeysForAddress(address):
            if not key in self.cache:
                #TODO: insert into table to process later
                self.cache_miss += 1
                continue
            self.cache_hit += 1
            lat, lng, formatted_address = self.cache[key]
            print "address -> ", lat, lng, formatted_address
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

# TODO: move this into a separate file
class Entities:
    geocoder = None
    missing_addresses = 0

    def __init__(self, geocoder):
        self.geocoder = geocoder
        pass

    def GetEntityId(self, name, address):
        """ Gets entity id for given combination of name and adress.
        It geocodes the address into addressId. If (name, addressId) is present
        in entities, returns its id, otherwise adds an entry into the database.

        Returns None if the entity is not present or could not be added (eg
        no address).
        """
        addressId = geocoder.GetAddressId(address)
        if (addressId is None): 
            missing_addresses += 1
            return None

        return None

def CreateAndSetProdSchema(db, prod_schema_name):
    with db.dict_cursor() as cur:
        cur.execute("CREATE SCHEMA %s", [AsIs(prod_schema_name)])
        cur.execute("SET search_path = %s", [AsIs(prod_schema_name)])
        # TODO: read this from a config
        # TODO: index on lat, lng
        cur.execute("""
            CREATE TABLE Addresses (
                id SERIAL PRIMARY KEY,
                lat DOUBLE PRECISION,
                lng DOUBLE PRECISION,
                address TEXT
            )
        """)

        cur.execute("""
            CREATE TABLE Entities (
                eid SERIAL PRIMARY KEY,
                name TEXT,
                address_id INTEGER REFERENCES Addresses(id)
            )
        """)



def ProcessSource(db_source, db_prod, geocoder, entities):

    sql = "select distinct on(organizations.id) organizations.id as org_id,organization_identifier_entries.ipo as ico,organization_name_entries.name, organizations.established_on,organizations.terminated_on,concat_ws(' ',organization_address_entries.formatted_address,organization_address_entries.street,organization_address_entries.building_number,organization_address_entries.postal_code,organization_address_entries.municipality,organization_address_entries.country) as address from organizations,organization_identifier_entries,organization_name_entries,organization_address_entries where organizations.id=organization_identifier_entries.organization_id and organizations.id=organization_name_entries.organization_id and organizations.id=organization_address_entries.organization_id limit 1000"


    with db_source.dict_cursor() as cur:
        cur.execute(sql)
        missed = 0
        found = 0;

        missed_eid = 0
        found_eid = 0
        for row in cur:
            address = row["address"]
            if address is None: continue
            name = row["name"]
            if name is None: continue

            addressId = geocoder.GetAddressId(address.encode("utf8"))
            print geocoder.GetKeysForAddress(address.encode("utf8"))
            if addressId is None:
                missed += 1
                continue
            found += 1;

            eid = entities.GetEntityId(row["ico"], name, address)
            if eid is None:
                missed_eid += 1
            found_eid += 1
    print "FOUND", found
    print "MISSED", missed
    print "FOUND EID", found_eid
    print "MISSED EID", missed_eid



def main():
    # TODO: make this a parameter
    prod_schema_name = "prod_20180303000000"
    source_schema_name = "source_ekosystem_rpo_20180303000000"

    db_old = DatabaseConnection(path_config='db_config_cache_table')
    db_source = DatabaseConnection(path_config='db_config_update_source.yaml',
                                   search_path=source_schema_name)
    db_prod = DatabaseConnection(path_config='db_config_update_source.yaml')
    CreateAndSetProdSchema(db_prod, prod_schema_name)

    geocoder = Geocoder(db_old, db_prod, "mysql.Entities")
    geocoder.GetAddressId("kukucinova 12 bratislava")
    ProcessSource(db_source, db_prod, geocoder)


    db_old.commit()
    db_old.close()
    db_prod.conn.rollback()
    #db_new.commit()
    db_prod.close()

    db_source.commit()
    db_source.close()

    print "STATS"
    print "CACHE HITS", geocoder.cache_hit
    print "CACHE MISS", geocoder.cache_miss
    pass

if __name__ == '__main__':
    main()
