import json
import unittest
import webapp2

import server


""" Unit testing of prepojenia server. Run all unit tests from command line as:
        python test.py
    To run an individual unit test only, run (for example):
        python test.py TestHandlers.test_subgraph
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

    def test_connection(self):
        content = _request_json('/connection?eid1=39541,78864,94764,229752&eid2=136671,229753', self)

    def test_subgraph(self):
        content = _request_json('/subgraph?eid1=39541,78864,94764,229752&eid2=136671,229753', self)
        self.assertTrue(content)


if __name__ == '__main__':
    unittest.main()
