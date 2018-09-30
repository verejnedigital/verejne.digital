#!/usr/bin/env python
# -*- coding: utf-8 -*-
import argparse
import json
import os
from paste import httpserver
import sys
import webapp2

import db_search
import skgeodesy

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../data/db')))
from db import DatabaseConnection

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../verejne')))
from api_GetInfos import get_GetInfos


class MyServer(webapp2.RequestHandler):
  """Abstract request handler, to be subclasses by server hooks."""

  def get(self):
    """Implements actual hook logic and responds to requests."""
    raise NotImplementedError('Must implement method `get`.')

  def returnJSON(self,j):
    self.response.headers['Content-Type'] = 'application/json'
    self.response.write(json.dumps(j, separators=(',',':')))


class KatasterInfoLocation(MyServer):
  def get(self):
    try:
      lat = float(self.request.GET['lat'])
      lon = float(self.request.GET['lon'])
    except:
      self.abort(400, detail='Could not parse coordinates as floats')
    tolerance = 0.00001
    circumvent_geoblocking = True
    verbose = False
    response = skgeodesy.get_cadastral_data_for_coordinates(
        lat, lon, tolerance, circumvent_geoblocking, verbose)
    self.returnJSON(response)


class KatasterInfoCompany(MyServer):
  def get(self):
    company_name = self.request.GET['name'].encode('utf8').decode('utf8')
    circumvent_geoblocking = True
    verbose = False
    response = skgeodesy.get_cadastral_data_for_company(
        company_name, circumvent_geoblocking, verbose)
    self.returnJSON(response)


class KatasterInfoPerson(MyServer):
  def get(self):
    self.returnJSON({})


class KatasterInfoPolitician(MyServer):
  def get(self):
    # Parse politician id
    try:
      politician_id = int(self.request.GET['id'])
    except:
      self.abort(400, detail='Could not parse parameter `id` as int')

    # Find Parcels owned by this politician in the database
    db_profil = webapp2.get_app().registry['db_profil']
    Parcels = db_search.get_Parcels_owned_by_Person(
        db_profil, politician_id)
    self.returnJSON(Parcels)


class InfoPolitician(MyServer):
  def get(self):
    # Parse politician id.
    try:
      politician_id = int(self.request.GET['id'])
    except:
      self.abort(400, detail='Could not parse parameter `id` as int')

    # Get politician information from profil database.
    db_profil = webapp2.get_app().registry['db_profil']
    politician = db_search.get_politician_by_PersonId(
        db_profil, politician_id)
    if politician is None:
      self.abort(
          404, detail='Could not find politician with provided `id`')

    # Add information about offices held by the politician.
    offices = db_search.get_offices_of_person(
      db_profil, politician_id)
    politician['offices'] = offices

    # Add entity information from database vd.
    db = webapp2.get_app().registry['db']
    rows = db.query(
        """
        SELECT eid FROM profilmapping
        WHERE profil_id=%s;
        """,
        [politician_id]
    )
    eids = [row['eid'] for row in rows]
    politician['entities'] = get_GetInfos(db, eids)

    self.returnJSON(politician)


class AssetDeclarations(MyServer):
  def get(self):
    # Parse politician id
    try:
      politician_id = int(self.request.GET['id'])
    except:
      self.abort(400, detail='Could not parse parameter `id` as int')

    # Find asset declarations of this politician in the database
    db_profil = webapp2.get_app().registry['db_profil']
    declarations = db_search.get_asset_declarations(
        db_profil, politician_id)
    self.returnJSON(declarations)


class ListPoliticians(MyServer):
  def get(self):

    # Retrieve `group` parameter:
    try:
      group = self.request.GET['group']
    except:
      self.abort(400, detail='Could not parse parameter `group`')

    # Determine SQL query filter based on the requested `group`:
    if group == 'all':
      query_filter = """
          AssetDeclarations.Year>=2016
          OR (
            PersonOffices.term_end>=2018
            AND Offices.name_male IN (
              'kandidát na primátora Bratislavy',
              'kandidát na prezidenta SR'
            )
          )
      """
    elif group == 'active':
      query_filter = 'AssetDeclarations.Year>=2016'
    elif group == 'nrsr_mps':
      query_filter = (
          "AssetDeclarations.Year>=2016 AND "
          "Offices.name_male='poslanec NRSR'")
    elif group == 'candidates_2018_bratislava_mayor':
      query_filter = (
          "PersonOffices.term_end=2018 AND "
          "Offices.name_male='kandidát na primátora Bratislavy'")
    elif group == 'candidates_2019_president':
      query_filter = (
          "PersonOffices.term_end=2019 AND "
          "Offices.name_male='kandidát na prezidenta SR'")
    else:
      self.abort(404, detail='Requested `group` not recognised.')

    # Return politicians augmented with property counts as JSON
    db_profil = webapp2.get_app().registry['db_profil']
    politicians = db_search.get_politicians_with_Folio_counts(
        db_profil, query_filter)
    self.returnJSON(politicians)


# Setup of the webapp2 WSGI application:
app = webapp2.WSGIApplication([
    ('/kataster_info_location', KatasterInfoLocation),
    ('/kataster_info_company', KatasterInfoCompany),
    ('/kataster_info_person', KatasterInfoPerson),
    ('/kataster_info_politician', KatasterInfoPolitician),
    ('/list_politicians', ListPoliticians),
    ('/info_politician', InfoPolitician),
    ('/asset_declarations', AssetDeclarations),
], debug=False)


def initialise_app():
  """Precomputes values to be shared across requests."""

  # Maintain two database connections: one into profil source schema,
  # and another into the latest production schema. Note these two must
  # be kept consistent for `profilmapping` to make sense; to this end,
  # the source_internal_profil_* schema is made visible to user
  # `kataster` together with prod data generation.

  db_profil = DatabaseConnection(path_config='db_config.yaml')
  schema = db_profil.get_latest_schema('source_internal_profil_')
  db_profil.execute('SET search_path to ' + schema + ';')
  app.registry['db_profil'] = db_profil

  db = DatabaseConnection(path_config='db_config.yaml')
  schema = db.get_latest_schema('prod_')
  db.execute('SET search_path to ' + schema + ';')
  app.registry['db'] = db


def main():
  parser = argparse.ArgumentParser()
  parser.add_argument('--listen',
                  help='host:port to listen on',
                  default='127.0.0.1:8083')
  args = parser.parse_args()

  initialise_app()

  host, port = args.listen.split(':')
  httpserver.serve(
      app,
      host=host,
      port=port,
      request_queue_size=128,
      use_threadpool=True,
      threadpool_workers=32,
  )

if __name__ == '__main__':
    main()
