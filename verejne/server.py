#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""Runs the server for backend application `verejne`."""
import argparse
import db_old
import simplejson as json
from paste import httpserver
import os
import sys
import webapp2

from api_GetInfos import get_GetInfos
from state import Entities
from utils import yaml_load

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../data/db')))
from db import DatabaseConnection


class MyServer(webapp2.RequestHandler):
    """Abstract class defining a server hook.

    All individual hooks inherit from this class and implement the
    method `get` performing the actual logic of the computation.
    """

    def get(self):
        raise NotImplementedError('Must implement method `get`.')

    def returnJSON(self, j):
        self.response.headers['Content-Type'] = 'application/json'
        self.response.write(json.dumps(j, separators=(',',':')))


class GetAddresses(MyServer):
    def get(self):
        # Parse URL parameters:
        try:
            lat1 = float(self.request.GET['lat1'])
            lat2 = float(self.request.GET['lat2'])
            lng1 = float(self.request.GET['lng1'])
            lng2 = float(self.request.GET['lng2'])
            restrictToSlovakia = bool(
                self.request.GET.get('restrictToSlovakia', False))
            level = int(self.request.GET.get('level', 3))
        except:
            self.abort(400, detail='Could not parse parameters')

        # Find addresses within the specified rectangle:
        q = """
            SELECT
              id AS address_id,
              lat,
              lng,
              address_flags.trade_with_government,
              address_flags.political_entity,
              address_flags.contact_with_politics
            FROM address
            LEFT JOIN address_flags
              ON address_flags.address_id=address.id
            WHERE  '(%s, %s), (%s, %s)'::box @> point(lat, lng)
            LIMIT 1500;
            """
        q_data = (lat1, lng1, lat2, lng2)
        response = webapp2.get_app().registry['db'].query(q, q_data)
        self.returnJSON(response)


class GetEntitiesAtAddressId(MyServer):
    def get(self):
        # Parse address_id from URL
        try:
            address_id = int(self.request.GET['address_id'])
        except:
            self.abort(400, detail="Could not parse parameter 'address_id' as an integer")

        # Find entities with the given address_id in the database
        q = """
            SELECT id, name FROM entities
            WHERE  address_id=%s;
            """
        q_data = [address_id]
        response = webapp2.get_app().registry['db'].query(q, q_data)
        self.returnJSON(response)


class GetEntities(MyServer):
    def get(self):
        try:
            lat1 = float(self.request.GET["lat1"])
            lat2 = float(self.request.GET["lat2"])
            lng1 = float(self.request.GET["lng1"])
            lng2 = float(self.request.GET["lng2"])
            restrictToSlovakia = bool(
                    self.request.GET.get("restrictToSlovakia", False))
            level = int(self.request.GET.get("level", 3))
        except:
            self.abort(400, detail="Could not parse parameters")

        if (level == 0) and ((lat2 - lat1) + (lng2 - lng1) > 2):
            self.abort(400, detail="Requested area is too large. If you want to download data for your own use, please contact us on Facebook.")

        entities = webapp2.get_app().registry['entities']
        self.response.headers['Content-Type'] = 'application/json'
        entities.getEntities(
                self.response, lat1, lng1, lat2, lng2, level, restrictToSlovakia)


class GetRelated(MyServer):
    def get(self):
        try:
            eid = int(self.request.GET["eid"])
        except:
            self.abort(400, detail="Could not parse parameter 'eid' as an integer")

        if eid < 0:
            self.abort(400, detail="Provided 'eid' is not an entity id")

        entities = webapp2.get_app().registry['entities']
        self.returnJSON(entities.getRelated(eid))


# Read info from all info tables and returns all related entities for the given eid
class GetInfo(MyServer):
    def get(self):
        try:
            eid = int(self.request.GET["eid"])
        except:
            self.abort(400, detail="Could not parse parameter 'eid' as an integer")

        # Copy total sum of contracts if present
        result = {}
        entities = webapp2.get_app().registry['entities']
        if eid in entities.eid_to_index:
            entity = entities.entities[entities.eid_to_index[eid]]
            result["total_contracts"] = entity.contracts

        # load info data from individual tables
        data_sources = webapp2.get_app().registry['data_sources']
        for table in data_sources:
            print "Processing table", table
            columns = ",".join(data_sources[table])
            sql = "SELECT DISTINCT " + columns + " FROM entities"
            if (table != "entities"):
                sql += " JOIN " + table + " ON " + "entities.id=" + table + ".id"
            sql += " WHERE entities.eid=%s"
            with db_old.getCursor() as cur:
                cur = db_old.execute(cur, sql, [eid])
                current = []
                for row in cur:
                    # TODO: is this needed?
                    r = {key: row[key] for key in row}
                    current.append(r)
                result[table] = current

        result["related"] = entities.getRelated(eid)
        self.returnJSON(result)


class GetInfos(MyServer):
    """ Given a list of eIDs, return a dictionary indexed by eIDs containing
        information from production tables about the respective entities.
        If an eID is not found, the corresponding information is an empty dict.
    """

    def get(self):
        # Parse eIDs
        try:
            eIDs = [int(x) for x in (self.request.GET['eids'].split(','))]
        except:
            self.abort(400, detail='Could not parse parameter "eids" as a list of integers')

        # Limit the number of eIDs in a single query
        max_count = 50
        if len(eIDs) > max_count:
            self.abort(400, detail='Too many eIDs requested at once (maximum %d)' % (max_count))

        # Obtain pointer to the database connection object
        db = webapp2.get_app().registry['db']

        # Carry out the API logic
        result = get_GetInfos(db, eIDs)

        # Return the result as JSON
        self.returnJSON(result)


# Search entity by name
class SearchEntityByName(MyServer):
    def get(self):
        try:
            text = self.request.GET["name"].encode("utf8")
        except:
            self.abort(400, detail="Unable to parse input text")

        q = """
            SELECT DISTINCT id AS eid FROM entities_search
            WHERE search_vector @@ plainto_tsquery('simple', unaccent(%s))
            LIMIT 20
            """

        q_data = [text]
        response = webapp2.get_app().registry['db'].query(q, q_data)
        self.returnJSON(response)


# Search entity by name
class SearchEntity(MyServer):
    def get(self):
        try:
            text = self.request.GET["text"].encode("utf8")
        except:
            self.abort(400, detail="Unable to parse input text")

        with db_old.getCursor() as cur:
            sql = "SELECT DISTINCT eid AS eid FROM entities " + \
                  "WHERE to_tsvector('unaccent', entity_name) @@ plainto_tsquery('unaccent', %s) " + \
                  "LIMIT 20"
            cur = db_old.execute(cur, sql, [text])
            result = []
            for row in cur:
                try:
                    result.append({"eid": row["eid"]})
                except:
                    pass
            self.returnJSON(result)


class SearchEntityByNameAndAddress(MyServer):
    """ Server hook allowing to search for entities by name and address
        (given in text format). Returns a list of dictionaries, with each
        dictionary of the form {'eid': 123456}. """
    def get(self):
        # Parse input
        try:
            firstname = self.request.GET["firstname"].encode("utf8")
            surname = self.request.GET["surname"].encode("utf8")
            address = self.request.GET["address"].encode("utf8")
        except:
            self.abort(400, detail="Unable to parse input text")

        # Carry-out the logic
        q = """
            SELECT DISTINCT
                eid AS eid
            FROM
                entities
            WHERE
                to_tsvector('unaccent', entity_name) @@ plainto_tsquery('unaccent', %s)
                AND
                to_tsvector('unaccent', address) @@ plainto_tsquery('unaccent', %s)
            LIMIT 20;
            """
        with db_old.getCursor() as cur:
            cur = db_old.execute(cur, q, (firstname + ' ' + surname, address))
            result = []
            for row in cur:
                try:
                    result.append({"eid": row["eid"]})
                except:
                    pass
            self.returnJSON(result)


# For given ico, find the corresponding eid and redirect to to its url.
# If no matching entity found redirect to default
class IcoRedirect(MyServer):
    def getEidForIco(self, ico):
        def getForTable(table):
            sql = "SELECT eid FROM " + table + \
                  " JOIN entities ON entities.id = " + table + ".id" + \
                  " WHERE ico = %s" + \
                  " LIMIT 1"
            with db_old.getCursor() as cur:
                cur = db_old.execute(cur, sql, [ico])
                row = cur.fetchone()
                if row is None: return None
                return row["eid"]

        eid = None
        eid = getForTable("new_orsr_data")
        if eid is None: eid = getForTable("firmy_data")
        if eid is None: eid = getForTable("orsresd_data")
        return eid

    def get(self):
        try:
            ico = int(self.request.GET["ico"])
        except:
            self.abort(400, detail="Could not parse parameter 'ico' as an integer")

        eid = self.getEidForIco(ico)
        print("LOG: icoredirect " + str(ico) + " " + str(eid))
        entities = webapp2.get_app().registry['entities']
        if (eid is None) or (not eid in entities.eid_to_index):
            return self.redirect("/")
        entity = entities.entities[entities.eid_to_index[eid]]
        return self.redirect("/?zobraz&%.7f&%.7f&%d" % (entity.lat, entity.lng, eid))


# Setup of the webapp2 WSGI application
app = webapp2.WSGIApplication([
    ('/getAddresses', GetAddresses),
    ('/getEntitiesAtAddressId', GetEntitiesAtAddressId),
    ('/getEntities', GetEntities),
    ('/getInfo', GetInfo),
    ('/getInfos', GetInfos),
    ('/getRelated', GetRelated),
    ('/ico', IcoRedirect),
    ('/searchEntity', SearchEntity),
    ('/searchEntityByName', SearchEntityByName),
    ('/searchEntityByNameAndAddress', SearchEntityByNameAndAddress),
], debug=False)


def initialise_app(serving_directory, disable_old_database=False):
    """Precomputes values shared across requests to this app.

    The registry property is intended for storing these precomputed
    values, so as to avoid global variables.
    """

    # Connect to the database:
    db = DatabaseConnection(path_config='db_config.yaml')
    schema = db.get_latest_schema('prod_')
    db.execute('SET search_path to ' + schema + ',public;')
    app.registry['db'] = db

    # For faster unit testing:
    if disable_old_database:
        return

    # Load (old) data sources:
    data_sources = yaml_load('datasources.yaml')
    app.registry['data_sources'] = data_sources

    # Load (old) entities:
    entities = Entities()
    entities.loadFromDirectory(serving_directory)
    app.registry['entities'] = entities


def main(args_dict):
    initialise_app(args_dict['serving_directory'])

    host, port = args_dict['listen'].split(':')
    httpserver.serve(
        app,
        host=host,
        port=port,
        request_queue_size=128,
        use_threadpool=True,
        threadpool_workers=32,
    )


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument(
        '--listen',
        default='127.0.0.1:8080',
        help='host:port to listen on')
    parser.add_argument(
        '--serving_directory',
        default='/data/www/verejne.digital/serving/prod/',
        help='Directory with serving data')
    args_dict = vars(parser.parse_args())
    main(args_dict)
