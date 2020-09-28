"""Unit tests for server obstaravania.
Run all unit test from command line as:
  python test.py
To run an individual unit test only, run (for example):
  python test.py TestHandlers.test_subgraph
"""
import json
import os
import sys
import unittest
import webapp2

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../data/db')))
from db import DatabaseConnection

import serving


def _request_json(url, test_handler):
    """Verifies that the given URL returns a valid JSON."""
    request = webapp2.Request.blank(url)
    response = request.get_response(serving.app)
    test_handler.assertEqual(response.status_int, 200)
    test_handler.assertEqual(response.content_type, 'application/json')
    j = json.loads(response.text)
    return j


class TestHandlers(unittest.TestCase):

    def test_info_notice(self):
        url = '/info_notice?id=159012'
        content = _request_json(url, self)
        print('InfoNotice:\n%s' % (content))


def main():
    serving.initialise_app()
    unittest.main()


if __name__ == '__main__':
    main()
