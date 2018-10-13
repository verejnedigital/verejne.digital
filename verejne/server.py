#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""Runs the server for backend application `verejne`."""

import argparse
import simplejson as json
from paste import httpserver
import os
import sys
import webapp2

from api_GetInfos import get_GetInfos

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


# Setup of the webapp2 WSGI application
app = webapp2.WSGIApplication([
    ('/getAddresses', GetAddresses),
    ('/getEntitiesAtAddressId', GetEntitiesAtAddressId),
    ('/getInfos', GetInfos),
    ('/searchEntityByName', SearchEntityByName),
], debug=False)


def initialise_app():
    """Precomputes values shared across requests to this app."""

    # Connect to the database:
    db = DatabaseConnection(path_config='db_config.yaml')
    schema = db.get_latest_schema('prod_')
    db.execute('SET search_path to ' + schema + ',public;')
    app.registry['db'] = db


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
