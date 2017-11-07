import io
import json
import math
import requests


# --- CADASTRAL API ---
def download_kataster_url(url, circumvent_geoblocking=False, verbose=False):
    if circumvent_geoblocking:
        url = 'https://zbgis.skgeodesy.sk/mkzbgis/proxy.ashx?' + url
    if verbose:
        print('URL: %s' % (url))
    return requests.get(url).text


# --- MATH ---
EARTH_EQUATORIAL_RADIUS = 6378137;

def WGS84_to_Mercator(lat, lon):
    x = math.radians(lon) * EARTH_EQUATORIAL_RADIUS
    y = math.log(math.tan(math.pi / 4 + math.radians(lat) / 2)) * EARTH_EQUATORIAL_RADIUS
    return x, y


# --- IO ---
def json_dump_utf8(var, path, indent=4, flatten_level=None):
    with io.open(path, 'w', encoding='utf-8') as f:
        data = json.dumps(var, f, indent=indent, sort_keys=True, separators=(',', ': '), ensure_ascii=False)
        if (indent is not None) and (flatten_level is not None):
            flatten_string = '\n' + ' '*(indent*flatten_level)
            data = data.replace(flatten_string, ' ')
            data = data.replace('\n' + ' '*(indent*(flatten_level-1)) + ']', ']')
        f.write(unicode(data))
