import json
import unittest
import webapp2

import server


""" Unit testing of backend application data.
    Run all unit tests from command line using:
        python test.py
    To only run an individual unit test, run (for example):
        python test.py TestHandlers.test_source_data_info
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

    def test_source_data_info(self):
        content = _request_json('/source_data_info', self)
        self.assertTrue(content)
    def test_prod_data_info(self):
        content = _request_json('/prod_data_info', self)
        self.assertTrue(content)
    def test_public_dumps_info(self):
        content = _request_json('/public_dumps_info', self)
        self.assertTrue(content)


if __name__ == '__main__':
    unittest.main()
