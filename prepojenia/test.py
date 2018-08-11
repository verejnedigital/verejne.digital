
"""Unit tests for server prepojenia.

Run all unit test from command line as:
  python test.py
To run an individual unit test only, run (for example):
  python test.py TestHandlers.test_subgraph
"""
import json
import unittest
import webapp2

import server


def _request_json(url, test_handler):
  """Verifies that the given URL returns a valid JSON."""
  request = webapp2.Request.blank(url)
  response = request.get_response(server.app)
  test_handler.assertEqual(response.status_int, 200)
  test_handler.assertEqual(response.content_type, 'application/json')
  j = json.loads(response.text)
  return j


class TestHandlers(unittest.TestCase):

  def test_connection(self):
    url = '/connection?eid1=39541,78864,94764,229752&eid2=136671,229753'
    content = _request_json(url, self)
    print('Connection:\n%s' % (content))

  def test_a_shortest_path(self):
    url = '/a_shortest_path?eid1=3264887&eid2=706143,1184394,1662599,1703776,2349437,3135421'
    content = _request_json(url, self)
    print('AShortestPath:\n%s' % (content))

  def test_subgraph(self):
    url = '/subgraph?eid1=39541,78864,94764,229752&eid2=136671,229753'
    content = _request_json(url, self)
    print('Subgraph:\n%s' % (content))
    self.assertTrue(content)


def main():
  max_relations_to_load = 10000000
  server.initialise_app(max_relations_to_load)
  unittest.main()


if __name__ == '__main__':
  main()
