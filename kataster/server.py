import argparse
import json
import os
from paste import httpserver
import sys
import webapp2

from db_search import get_politician_by_PersonId, get_Parcels_owned_by_Person, get_politicians_with_Folio_counts, get_asset_declarations
from skgeodesy import get_cadastral_data_for_coordinates, get_cadastral_data_for_company

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../data/db')))
from db import DatabaseConnection

# TEMP
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../data')))
from status import get_source_data_info, get_prod_data_info


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
        response = get_cadastral_data_for_coordinates(lat, lon, tolerance, circumvent_geoblocking, verbose)
        self.returnJSON(response)

class KatasterInfoCompany(MyServer):
    def get(self):
        company_name = self.request.GET["name"].encode("utf8").decode("utf8")
        circumvent_geoblocking = True
        verbose = False
        response = get_cadastral_data_for_company(company_name, circumvent_geoblocking, verbose)
        self.returnJSON(response)

class KatasterInfoPerson(MyServer):
    def get(self):
        self.returnJSON({})

class KatasterInfoPolitician(MyServer):
    def get(self):
        # Parse politician id
        try:
            politician_id = int(self.request.GET["id"])
        except:
            self.abort(400, detail="Could not parse parameter 'id' as int")

        # Find Parcels owned by this politician in the database
        db = DatabaseConnection(path_config='db_config.yaml', search_path='kataster')
        Parcels = get_Parcels_owned_by_Person(db, politician_id)
        db.close()
        self.returnJSON(Parcels)

class InfoPolitician(MyServer):
    def get(self):
        # Parse politician id
        try:
            politician_id = int(self.request.GET["id"])
        except:
            self.abort(400, detail="Could not parse parameter 'id' as int")

        # Get politician information from database
        db = DatabaseConnection(path_config='db_config.yaml', search_path='kataster')
        politician = get_politician_by_PersonId(db, politician_id)
        db.close()
        if politician is None:
            self.abort(404, detail="Could not find politician with provided 'id'")
        self.returnJSON(politician)

class AssetDeclarations(MyServer):
    def get(self):
        # Parse politician id
        try:
            politician_id = int(self.request.GET["id"])
        except:
            self.abort(400, detail="Could not parse parameter 'id' as int")

        # Find asset declarations of this politician in the database
        db = DatabaseConnection(path_config='db_config.yaml', search_path='kataster')
        declarations = get_asset_declarations(db, politician_id)
        db.close()
        self.returnJSON(declarations)

class ListPoliticians(MyServer):
    def get(self):
        # Return politicians augmented with property counts as JSON
        db = DatabaseConnection(path_config='db_config.yaml', search_path='kataster')
        politicians = get_politicians_with_Folio_counts(db)
        db.close()
        self.returnJSON(politicians)

# TEMP
class SourceDataInfo(MyServer):
    def get(self):
        result = get_source_data_info()
        self.returnJSON(result)
class ProdDataInfo(MyServer):
    def get(self):
        result = get_prod_data_info()
        self.returnJSON(result)


app = webapp2.WSGIApplication([
    ('/kataster_info_location', KatasterInfoLocation),
    ('/kataster_info_company', KatasterInfoCompany),
    ('/kataster_info_person', KatasterInfoPerson),
    ('/kataster_info_politician', KatasterInfoPolitician),
    ('/list_politicians', ListPoliticians),
    ('/info_politician', InfoPolitician),
    ('/asset_declarations', AssetDeclarations),
    # TEMP
    ('/source_data_info', SourceDataInfo),
    ('/prod_data_info', ProdDataInfo),
], debug=False)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--listen',
                    help='host:port to listen on',
                    default='127.0.0.1:8083')
    args = parser.parse_args()
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
