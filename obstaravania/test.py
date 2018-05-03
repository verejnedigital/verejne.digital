import json
import unittest
import webapp2

import serving


""" Unit testing of backend application obstaravania.
    Run all unit tests from command line as:
        python test.py
    To run an individual unit test only, run (for example):
        python test.py TestHandlers.test_list_obstaravania
"""

def _request_json(url, test_handler):
    """ Utility method to check a JSON is returned from the given URL """
    request = webapp2.Request.blank(url)
    response = request.get_response(serving.app)
    test_handler.assertEqual(response.status_int, 200)
    test_handler.assertEqual(response.content_type, 'application/json')
    j = json.loads(response.text)
    return j


class TestHandlers(unittest.TestCase):

    def test_info_obstaravanie(self):
        content = _request_json('/info_obstaravanie?id=177241', self)
        self.assertTrue(content)
        print('===== info_obstaravanie response =====')
        print(content)

    def test_list_obstaravania(self):
        content = _request_json('/list_obstaravania', self)
        self.assertTrue(content)
        print('===== list_obstaravania response =====')
        print(content)


if __name__ == '__main__':
    unittest.main()
