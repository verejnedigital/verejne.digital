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
    """Abstract request handler, to be subclassed by server hooks."""

    def get(self):
        """Implements actual hook logic and responds to requests."""
        raise NotImplementedError('Must implement method `get`.')

    def _parse_int(self, parameter, default=None, max_value=None):
        """Attempts to parse an integer GET `parameter`."""
        if default and (parameter not in self.request.GET):
            return default
        try:
            value = int(self.request.GET[parameter])
        except:
            self.abort(400, detail='Parameter "%s" must be integer' % (parameter))
        if max_value and (value > max_value):
            self.abort(400, detail='Parameter "%s" must be <= %d' % (parameter, max_value))
        return value

    def returnJSON(self, j):
        self.response.headers['Content-Type'] = 'application/json'
        self.response.write(json.dumps(j, separators=(',', ':')))


class GetAddresses(MyServer):
    def get(self):
        """Returns basic information for entities in a given rectangle."""

        # Parse rectangle boundaries from the URL:
        try:
            lat1 = float(self.request.GET['lat1'])
            lat2 = float(self.request.GET['lat2'])
            lng1 = float(self.request.GET['lng1'])
            lng2 = float(self.request.GET['lng2'])
        except:
            self.abort(400, detail='Could not parse parameters')

        # Query the database:
        response = webapp2.get_app().registry['db'].query(
            """
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
            """,
            [lat1, lng1, lat2, lng2]
        )
        self.returnJSON(response)


class GetEntitiesAtAddressId(MyServer):
    def get(self):
        """Returns entities (ids and names) at a given `address_id`."""

        # Parse parameter from the URL:
        address_id = self._parse_int("address_id")

        # Query the database:
        response = webapp2.get_app().registry['db'].query(
            """
            SELECT id, name FROM entities
            WHERE  address_id=%s;
            """,
            [address_id]
        )
        self.returnJSON(response)


class GetInfos(MyServer):
    def get(self):
        """Returns a dictionary mapping eIDs to entity information.

        The dictionary contains an entry for each (unique) requested eID.
        Each entry is itself a dictionary. If an eID is not found, the
        corresponding information is an empty dictionary.
        """

        # Parse eIDs from the URL, imposing a limit on their count:
        try:
            eIDs = [int(x) for x in (self.request.GET['eids'].split(','))]
        except:
            self.abort(400, detail='Could not parse parameter "eids" as a list of integers')
        max_count = 50
        if len(eIDs) > max_count:
            self.abort(400, detail='Too many eIDs requested at once (maximum %d)' % (max_count))

        # Query the database:
        result = get_GetInfos(
            webapp2.get_app().registry['db'],
            eIDs,
            self._parse_int("max_eufunds_largest", default=10),
            self._parse_int("max_contracts_recents", default=5),
            self._parse_int("max_contracts_largest", default=15),
            self._parse_int("max_notices_recent", default=5)
        )
        self.returnJSON(result)


# Search entity by name
class SearchEntityByName(MyServer):
    def get(self):
        """Returns eIDs of entities with names matching the search."""

        # Parse parameters from the URL:
        try:
            text = self.request.GET["name"]
        except:
            self.abort(400, detail="Unable to parse input text")
        limit = self._parse_int('limit', default=20, max_value=100)

        # Query the database:
        response = webapp2.get_app().registry['db'].query(
            """
            SELECT DISTINCT id AS eid FROM entities_search
            WHERE search_vector @@ plainto_tsquery('simple', unaccent(%s))
            LIMIT %s
            """,
            [text, limit]
        )
        self.returnJSON(response)


class SearchEntityByIco(MyServer):
    def get(self):
        """Returns eID of entity with given ICO."""

        # Parse parameters from the URL:
        try:
            ico = int(self.request.GET["ico"])
        except:
            self.abort(400, detail="Unable to parse input text")

        # Query the database:
        response = webapp2.get_app().registry['db'].query(
            """
            SELECT DISTINCT eid FROM companyinfo
            WHERE ico=%s
            """,
            [ico]
        )
        self.returnJSON(response)


# Setup of the webapp2 WSGI application
app = webapp2.WSGIApplication([
    ('/getAddresses', GetAddresses),
    ('/getEntitiesAtAddressId', GetEntitiesAtAddressId),
    ('/getInfos', GetInfos),
    ('/searchEntityByName', SearchEntityByName),
    ('/searchEntityByIco', SearchEntityByIco),
], debug=False)


def initialise_app():
    """Precomputes values shared across requests to this app."""

    # Connect to the database:
    db = DatabaseConnection(path_config='db_config.yaml')
    schema = db.get_latest_schema('prod_')
    db.execute('SET search_path to ' + schema + ',public;')
    app.registry['db'] = db


def main(args_dict):
    initialise_app()

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
    args_dict = vars(parser.parse_args())
    main(args_dict)
