# Experimental code by Mato
import argparse
import io
import json
import math
import requests
import sys

EARTH_EQUATORIAL_RADIUS = 6378137;

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


# ----- UTILS -----
def json_dump_utf8(var, path, indent=4, flatten_level=None):
    with io.open(path, 'w', encoding='utf-8') as f:
        data = json.dumps(var, f, indent=indent, sort_keys=True, separators=(',', ': '), ensure_ascii=False)
        if (indent is not None) and (flatten_level is not None):
            flatten_string = '\n' + ' '*(indent*flatten_level)
            data = data.replace(flatten_string, ' ')
            data = data.replace('\n' + ' '*(indent*(flatten_level-1)) + ']', ']')
        f.write(unicode(data))

def WGS84_to_Mercator(lat, lon):
    x = math.radians(lon) * EARTH_EQUATORIAL_RADIUS
    y = math.log(math.tan(math.pi / 4 + math.radians(lat) / 2)) * EARTH_EQUATORIAL_RADIUS
    return x, y

def download_url(url, circumvent_geoblocking=False, verbose=False):
    if circumvent_geoblocking:
        url = 'https://zbgis.skgeodesy.sk/mkzbgis/proxy.ashx?' + url
    if verbose:
        print('URL: %s' % (url))
    return requests.get(url).text


# ----- MAIN SCRIPT -----
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
    content = download_url(url, circumvent_geoblocking, verbose)
    
    # Parse response JSON
    try:
        json_data = json.loads(content)
    except:
        print('Fatal (terminating): Could not parse identify response JSON:')
        print(content)
        return
    
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

    # Download owners at parsed parcels
    owners = []
    for parcel_type, ID in parcels:
        if verbose:
            print('Downloading Parcel%c with ID %s...' % (parcel_type, ID))

        # Accumulate owners from all pages
        url = 'https://kataster.skgeodesy.sk/PortalOData/Parcels' + parcel_type + '(' + ID + ')/Kn.Participants?%24filter=Type%2FCode+eq+1&%24select=Id%2CName%2CValidTo%2CNumerator%2CDenominator&%24expand=OwnershipRecord(%24select%3DOrder)&%24orderby=OwnershipRecord%2FOrder&%24count=true'
        while True:
            content = download_url(url, circumvent_geoblocking, verbose)
            try:
                j = json.loads(content)
            except:
                print('Warning: Could not parse owners response JSON:')
                print(content)
                break
            if 'value' not in j:
                print('Warning: no value in JSON returned by ESKN:')
                print(j)
                break

            # Print owners in this batch and append them to owners list
            for owner in j['value']:
                print('%s' % (owner['Name']))
            owners += j['value']

            # Continue with URL of next page if there is one
            if '@odata.nextLink' not in j:
                break
            url = j['@odata.nextLink']

    # Dump accumulated values to JSON
    path_output = 'output_owners.json'
    json_dump_utf8(owners, path_output)
    print('JSON with %d owners dumped to %s' % (len(owners), path_output))


# --- Make script runnable ---
def main(args_dict):
    # Extract query
    lat = args_dict['lat']
    lon = args_dict['lon']
    circumvent_geoblocking = args_dict['circumvent_geoblocking']
    verbose = args_dict['verbose']
    get_cadastral_data(lat, lon, circumvent_geoblocking, verbose)

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('lon', type=float, help='longitude of click')
    parser.add_argument('lat', type=float, help='latitude of click')
    parser.add_argument('--circumvent_geoblocking', dest='circumvent_geoblocking', action='store_true', default=False, help='use ZBGIS proxy to circumvent geoblocking')
    parser.add_argument('--verbose', dest='verbose', action='store_true', default=False)
    args_dict = vars(parser.parse_args())
    main(args_dict)
