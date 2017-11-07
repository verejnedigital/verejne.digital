# Experimental code by Mato
import argparse
import json
from paste import httpserver
import webapp2
import yaml

from utils import download_cadastral_json, download_cadastral_pages, WGS84_to_Mercator, json_dump_utf8

""" Identifies the parcel at given (longitude, latitude) coordinates and
returns the list of owners. The circumvent_geoblocking flag should allow
the script to run in countries blocked by https://kataster.skgeodesy.sk.
The owners are printed to stdout and a JSON is saved to output_owners.json.

Example runs:
    python kataster.py 17.0910016 48.1451953 --circumvent_geoblocking
    (Bonaparte)

    python kataster.py 17.09270 48.14588 --circumvent_geoblocking
    (nahodny domcek nedaleko Bonaparte)

    python kataster.py 21.261691 48.725668 --circumvent_geoblocking
    (nahodny dom v Kosiciach pri Mestskom parku)

Possible issues:
- Not familiar with different coordinate systems; may not have used
    exactly the right conversion formulas.
- The mapExtent and imageDisplay arguments of the identify API are required,
    but currently set to some fixed values. Based on the documentation
    this should be fine and actually seems to work all right, but it is odd.
"""


def get_cadastral_data(lat, lon, circumvent_geoblocking, verbose):
    # Convert to Mercator (EPSG:3857)
    X, Y = WGS84_to_Mercator(lat, lon)
    if verbose:
        print('Mercator coordinates: (%.9f | %.9f)' % (X, Y))

    # Identify object at Mercator coordinates (X, Y)
    url = ('https://kataster.skgeodesy.sk/eskn/rest/services/VRM/identify/MapServer/identify?'
           'f=json&'
           'geometryType=esriGeometryPoint&'
           'geometry=%7B%22x%22%3A' + ('%.9f' % (X)) + '%2C%22y%22%3A' + ('%.9f' % (Y)) + '%7D&'
           'sr=3857&'
           'layers=all&'  # try using all instead of 1 if does not work
           'time=&layerTimeOptions=&layerdefs=&tolerance=0&'
           'mapExtent=1902836.4433083886%2C6131302.14771959%2C1902310.3415745723%2C6130808.890021369&'
           'imageDisplay=881%2C826%2C96&'
           'returnGeometry=false&'
           'maxAllowableOffset=')
    json_data = download_cadastral_json(url, circumvent_geoblocking, verbose)
    if json_data is None:
        return None
    
    # Check result is available
    results = [r for r in json_data['results'] if 'PARCELS' in r['layerName']]
    if len(results) == 0:
        print('No object has been found at provided coordinates')
        return
    if verbose:
        for result in results:
            print('%d | %s | %s | %s' % (result['layerId'], result['layerName'], result['displayFieldName'], result['value']))

    # Parse results into set of pairs (parcel_type, parcel_ID), where parcel_type = {C, E}
    parcels = set([(r['layerName'][-1], r['attributes']['ID']) for r in results])

    # Download parsed Parcels
    response = {'lat': lat, 'lon': lon, 'X': X, 'Y': Y, 'Parcels': []}
    for parcel_type, ParcelId in parcels:
        if verbose:
            print('Downloading Parcel%c(%s)...' % (parcel_type, ParcelId))

        url_parcel = 'https://kataster.skgeodesy.sk/PortalOData/Parcels' + parcel_type + '(' + ParcelId + ')/'
        
        # Download parcel metadata
        url = url_parcel + '?$select=Id,ValidTo,No,Area,HouseNo,Extent&$expand=OwnershipType($select=Name,Code),CadastralUnit($select=Name,Code),Localization($select=Name),Municipality($select=Name),LandUse($select=Name),SharedProperty($select=Name),ProtectedProperty($select=Name),Affiliation($select=Name),Folio($select=Id,No),Utilisation($select=Name),Status($select=Code)'
        Parcel = download_cadastral_json(url, circumvent_geoblocking, verbose)
        if Parcel is None:
            continue
        Parcel['ParcelType'] = parcel_type

        # Construct Folio URL and add it to the JSON
        if Parcel['Folio'] is not None:
            FolioURL = 'https://kataster.skgeodesy.sk/EsknBo/Bo.svc/GeneratePrf?prfNumber=%s&cadastralUnitCode=%s&outputType=html' % (Parcel['Folio']['No'], Parcel['CadastralUnit']['Code'])
            Parcel['Folio']['URL'] = FolioURL

        # Log downloaded Parcel
        if verbose:
            print('LandUse:\n  %s' % (Parcel['LandUse']['Name']))
            print('Utilisation:\n  %s' % (Parcel['Utilisation']['Name']))
            print('Area:\n  %s' % (Parcel['Area']))
            if Parcel['Folio'] is not None:
                print('LV URL\n  %s' % (Parcel['Folio']['URL']))
        path_output = 'Parcel%s(%s).json' % (parcel_type, ParcelId)
        json_dump_utf8(Parcel, path_output)

        # Accumulate owners from all pages
        url = url_parcel + 'Kn.Participants?$select=Id,Name&$expand=Subjects($select=Id,FirstName,Surname;$expand=Address($select=Id,Street,HouseNo,Municipality,Zip,State))'
        Participants = download_cadastral_pages(url, circumvent_geoblocking, verbose)
        if verbose:
            print('Owners:')
            for Participant in Participants:
                for Subject in Participant['Subjects']:
                    Address = Subject['Address']
                    print('  %s | %s | %s | %s | %s | %s | %s' % (Subject['Surname'], Subject['FirstName'], Address['Street'], Address['HouseNo'], Address['Municipality'], Address['Zip'], Address['State']))
        Parcel['Participants'] = Participants

        # Save to JSON response
        response['Parcels'].append(Parcel)

    # Dump final response to JSON
    path_output = 'response.json'
    json_dump_utf8(response, path_output)
    print('JSON with %d Parcels dumped to %s' % (len(response['Parcels']), path_output))
    return response

# All individual hooks inherit from this class outputting jsons
# Actual work of subclasses is done in method process
class MyServer(webapp2.RequestHandler):
    def returnJSON(self,j):
      self.response.headers['Content-Type'] = 'application/json'
      self.response.write(json.dumps(j, separators=(',',':')))

    def get(self):
      self.process()

class KatasterInfo(MyServer):
    def process(self):
      lat = float(self.request.GET["lat"])
      lon = float(self.request.GET["lon"])
      circumvent_geoblocking = True
      verbose = False
      return self.returnJSON(get_cadastral_data(lat, lon, circumvent_geoblocking, verbose))

def main():
  parser = argparse.ArgumentParser()
  parser.add_argument('--listen',
                    help='host:port to listen on',
                    default='127.0.0.1:8083')
  args = parser.parse_args()
  host, port = args.listen.split(':')

  app = webapp2.WSGIApplication([
      ('/kataster_info', KatasterInfo)
      ], debug=False)

  httpserver.serve(
      app,
      host=host,
      port=port)
  
if __name__ == '__main__':
  main()
