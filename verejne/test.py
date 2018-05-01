import json
import unittest
import webapp2

import server


""" Unit testing of backend application verejne.
    Run all unit tests from command line as:
        python test.py
    To run an individual unit test only, run (for example):
        python test.py TestHandlers.test_getEntities
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

    def test_getEntities(self):
        content = _request_json('/getEntities?level=0&lat1=48.31306363500883&lng1=17.25013026130364&lat2=48.31751977226477&lng2=17.257496582309614', self)
        self.assertTrue(content)
        print('===== getEntities response =====')
        print(content)

    def test_getInfo(self):
        content = _request_json('/getInfo?eid=389093', self)
        self.assertTrue(content)
        print('===== getInfo response =====')
        print(content)

    def test_getRelated(self):
        content = _request_json('/getRelated?eid=389093', self)
        self.assertTrue(content)
        print('===== getRelated response =====')
        print(content)

    def test_ico(self):
        # This server hook performs redirection (response code 302)
        request = webapp2.Request.blank('/ico?ico=36829757')
        response = request.get_response(server.app)
        self.assertEqual(response.status_int, 302)

    def test_searchEntity(self):
        content = _request_json('/searchEntity?text=stefan%20skrucany', self)
        self.assertTrue(content)
        print('===== searchEntity response =====')
        print(content)

    def test_searchEntityByNameAndAddress(self):
        content = _request_json('/searchEntityByNameAndAddress?firstname=Ladislav&surname=Basternak&address=Hodalova', self)
        self.assertTrue(content)
        print('===== searchEntityByNameAndAddress response =====')
        print(content)


def main():
    # Initialise app
    serving_directory = '/service/verejne_prod/data/'
    server.initialise_app(serving_directory)

    # Start unit tests
    unittest.main()

if __name__ == '__main__':
    main()
