import json
import unittest
import webapp2

import server


""" Unit testing of kataster server. Run all unit tests from command line as:
        python test.py
    To run an individual unit test only, run (for example):
        python test.py TestHandlers.test_kataster_info_politician
"""

def _request_json(url, test_handler):
    """ Utility method to check a JSON is returned from the given URL """
    request = webapp2.Request.blank(url)
    response = request.get_response(server.app)
    test_handler.assertEqual(response.status_int, 200)
    test_handler.assertEqual(response.content_type, 'application/json')
    j = json.loads(response.text)
    return j


class TestHandlers(unittest.TestCase):

    def test_kataster_info_location(self):
        content = _request_json('/kataster_info_location?lat=48.1451953&lon=17.0910016', self)
        self.assertTrue(content)

    def test_kataster_info_company(self):
        content = _request_json('/kataster_info_company?name="KOLIBA REAL a.s."', self)
        self.assertTrue(content)

    def test_kataster_info_person(self):
        content = _request_json('/kataster_info_person', self)

    def test_kataster_info_politician(self):
        content = _request_json('/kataster_info_politician?id=40', self)

    def test_list_politicians(self):
        content = _request_json('/list_politicians', self)
        self.assertTrue(content)

    def test_info_politician(self):
        content = _request_json('/info_politician?id=40', self)
        self.assertTrue(content)

    def test_asset_declarations(self):
        content = _request_json('/asset_declarations?id=40', self)

    # TEMP
    def test_source_data_info(self):
        content = _request_json('/source_data_info', self)
        self.assertTrue(content)

    def test_prod_data_info(self):
        content = _request_json('/prod_data_info', self)
        self.assertTrue(content)


if __name__ == '__main__':
    unittest.main()
