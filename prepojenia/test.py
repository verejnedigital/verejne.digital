
"""Unit tests for server prepojenia.

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

  def test_a_shortest_path_of_unit_length(self):
    """Tests finding a shortest path between endpoints of an edge."""

    # Find a relation in the database:
    db = DatabaseConnection(path_config='db_config.yaml')
    schema = db.get_latest_schema('prod_')
    db.execute('SET search_path to ' + schema + ';')
    rel = db.query('SELECT eid, eid_relation FROM related LIMIT 1')[0]
    source = int(rel["eid"])
    target = int(rel["eid_relation"])

    # Check that the shortest path of length 1 is found:
    url = '/a_shortest_path?eid1=%d&eid2=%d' % (source, target)
    content = _request_json(url, self)
    print('AShortestPath:\n%s' % (content))
    self.assertListEqual(content, [source, target])

  def test_subgraph(self):
    url = '/subgraph?eid1=3264887&eid2=706143,1184394,1662599,1703776,2349437,3135421'
    content = _request_json(url, self)
    self.assertIsInstance(content, dict)
    self.assertTrue('vertices' in content)
    self.assertTrue('edges' in content)
    print('Subgraph (|V|=%d, |E|=%d):\n%s' % (
      len(content['vertices']), len(content['edges']), content))

  def test_notable_connections(self):
    url = '/notable_connections?eid=294113'
    content = _request_json(url, self)
    self.assertIsInstance(content, dict)
    self.assertTrue('vertices' in content)
    self.assertTrue('edges' in content)
    print('NotableConnections subgraph (|V|=%d, |E|=%d):\n%s' % (
      len(content['vertices']), len(content['edges']), content))


def main():
  max_relations_to_load = 123456789
  disable_old_database = True

  server.initialise_app(max_relations_to_load, disable_old_database)
  unittest.main()


if __name__ == '__main__':
  main()
