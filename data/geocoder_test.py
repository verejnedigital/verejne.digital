import os
import sys
import unittest

import geocoder as geocoder_lib
#import db.db
#sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../data/db')))
from db.db import DatabaseConnection

class GeocoderTest(unittest.TestCase):

    # Setup is a class method, otherwise it instantiates geocoder for each single test which
    # then causes to read data from database for every single test which is then slow.
    @classmethod
    def setUpClass(cls):
        super(GeocoderTest, cls).setUpClass()
        db_address_cache = DatabaseConnection(
            path_config='db_config_update_source.yaml',
            search_path='address_cache')
        cls.geocoder = geocoder_lib.Geocoder(db_address_cache, None, True)

    def test_case_insensitive(self):
        self.assertEqual(
            list(self.geocoder.GetKeysForAddress("ulica 11/222 33333 mesto")),
            list(self.geocoder.GetKeysForAddress("UliCa 11/222  33333  MesTO  ")),
        )

    def test_keys_match(self):
        self.assertItemsEqual(
            self.geocoder.GetKeysForAddress("Ulica 11/222 33333 Mesto"),
            ['ulica11/22233333mesto', 'ulica222/1133333mesto', 'ulica22233333mesto',
             'ulica11/222mesto', 'ulica222/11mesto', 'ulica222mesto']
        )

if __name__ == '__main__':
    unittest.main()        
