import datetime
import io
import json
import math
import requests
import sys
import time
import unicodedata


# --- CADASTRAL API ---
def download_cadastral_url(url, circumvent_geoblocking=False, verbose=False):
    """ Download a single URL, optionally using the cadastral proxy """
    if circumvent_geoblocking:
        url = 'https://zbgis.skgeodesy.sk/mkzbgis/proxy.ashx?' + url
    if verbose:
        print('URL: %s' % (url))
        start_time = time.time()
    response_text = requests.get(url).text
    if verbose:
        duration = time.time() - start_time
        print('Download duration %ds' % (duration))
    return response_text

def download_cadastral_json(url, circumvent_geoblocking=False, verbose=False):
    """ Download and parse a single JSON from the cadastral API """
    content = download_cadastral_url(url, circumvent_geoblocking, verbose)
    try:
        j = json.loads(content)
    except:
        print('ERROR: Could not parse JSON response from URL %s:\n%s' % (url, content))
        return None
    if ('Message' in j) and (j['Message'].startswith('Error')):
        print('ERROR: Error message in cadastral JSON response from URL %s:\n%s' % (url, j))
        return None
    return j

def download_cadastral_pages(url_start, circumvent_geoblocking=False, verbose=False):
    """ Download and parse paginated JSON from the cadatral API """
    values = []
    url = url_start
    while True:
        j = download_cadastral_json(url, circumvent_geoblocking, verbose)
        if (j is None) or ('value' not in j):
            break
        values += j['value']
        if '@odata.nextLink' not in j:
            break
        url = j['@odata.nextLink']
    return values


# --- SEARCH ---
def remove_accents(s):
    s_NFKD = unicodedata.normalize('NFKD', s)
    return u''.join([c for c in s_NFKD if not unicodedata.combining(c)])

def search_string(s):
    """ Function to obtain search string from original string (such
        as FirstName or Surname), consistently with how it's done in
        the OData cadastral API. """
    return remove_accents(s).replace(' ', '').replace('.', '').replace(',', '').replace('-', '').lower()

def is_contained_ci(pattern, text):
    return pattern.lower() in text.lower()


# --- MATH ---
EARTH_EQUATORIAL_RADIUS = 6378137;

def WGS84_to_Mercator(lat, lon):
    x = math.radians(lon) * EARTH_EQUATORIAL_RADIUS
    y = math.log(math.tan(math.pi / 4 + math.radians(lat) / 2)) * EARTH_EQUATORIAL_RADIUS
    return x, y

def Mercator_to_WGS84(x, y):
    lat = math.degrees(2 * math.atan(math.exp(y / EARTH_EQUATORIAL_RADIUS)) - math.pi / 2)
    lon = math.degrees(x / EARTH_EQUATORIAL_RADIUS)
    return lat, lon


# --- IO ---
def json_load(path):
    with open(path, 'r') as f:
        data_json = json.load(f)
    return data_json

def json_dump_utf8(var, path, indent=4, flatten_level=None):
    with io.open(path, 'w', encoding='utf-8') as f:
        data = json.dumps(var, f, indent=indent, sort_keys=True, separators=(',', ': '), ensure_ascii=False)
        if (indent is not None) and (flatten_level is not None):
            flatten_string = '\n' + ' '*(indent*flatten_level)
            data = data.replace(flatten_string, ' ')
            data = data.replace('\n' + ' '*(indent*(flatten_level-1)) + ']', ']')
        f.write(unicode(data))

# --- REPORTING ---
def print_progress(string):
    sys.stdout.write('\r%s' % (string))
    sys.stdout.flush()
