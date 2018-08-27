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


# All individual hooks inherit from this class
# Actual work of subclasses is done in method get
class MyServer(webapp2.RequestHandler):
  def returnJSON(self,j):
    self.response.headers['Content-Type'] = 'application/json'
    self.response.write(json.dumps(j, separators=(',',':')))


class KatasterInfoLocation(MyServer):
  def get(self):
    try:
      lat = float(self.request.GET["lat"])
      lon = float(self.request.GET["lon"])
    except:
      self.abort(400, detail="Could not parse coordinates as floats")
    tolerance = 0.00001
    circumvent_geoblocking = True
    verbose = False
    response = skgeodesy.get_cadastral_data_for_coordinates(
        lat, lon, tolerance, circumvent_geoblocking, verbose)
    self.returnJSON(response)


class KatasterInfoCompany(MyServer):
  def get(self):
    company_name = self.request.GET["name"].encode("utf8").decode("utf8")
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
    db = webapp2.get_app().registry['db']
    Parcels = db_search.get_Parcels_owned_by_Person(
        db, politician_id)
    self.returnJSON(Parcels)


class InfoPolitician(MyServer):
  def get(self):
    # Parse politician id
    try:
      politician_id = int(self.request.GET['id'])
    except:
      self.abort(400, detail='Could not parse parameter `id` as int')

    # Get politician information from database
    db = webapp2.get_app().registry['db']
    politician = db_search.get_politician_by_PersonId(
        db, politician_id)
    if politician is None:
      self.abort(
          404, detail='Could not find politician with provided `id`')
    self.returnJSON(politician)


class AssetDeclarations(MyServer):
  def get(self):
    # Parse politician id
    try:
      politician_id = int(self.request.GET['id'])
    except:
      self.abort(400, detail='Could not parse parameter `id` as int')

    # Find asset declarations of this politician in the database
    db = webapp2.get_app().registry['db']
    declarations = db_search.get_asset_declarations(db, politician_id)
    self.returnJSON(declarations)


class ListPoliticians(MyServer):
  def get(self):
    # Return politicians augmented with property counts as JSON
    db = webapp2.get_app().registry['db']
    politicians = db_search.get_politicians_with_Folio_counts(db)
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
  app.registry['db'] = DatabaseConnection(search_path='profil')


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
