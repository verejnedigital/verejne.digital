#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""Runs the server for backend application `prepojenia`."""
import argparse
import json
import os
from paste import httpserver
import sys
import webapp2

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../data/db')))
from db import DatabaseConnection

from relations import Relations


class MyServer(webapp2.RequestHandler):
  """Abstract request handler, to be subclasses by server hooks."""

  def get(self):
    """Implements actual hook logic and responds to requests."""
    raise NotImplementedError('Must implement method `get`.')

  def _parse_int(self, parameter, default=None, max_value=None):
    """Attempts to parse an integer GET `parameter`."""
    if default and (parameter not in self.request.GET):
      return default
    try:
      value = int(self.request.GET[parameter])
    except:
      self.abort(400, detail='Parameter "%s" must be integer' % (
        parameter))
    if max_value and (value > max_value):
      self.abort(400, detail='Parameter "%s" must be <= %d' % (
        parameter, max_value))
    return value

  def _parse_eid_list(self, parameter, limit=50):
    """Parses eids from comma-separated GET string `parameter`."""
    try:
      eids = [
        int(x)
        for x in (self.request.GET[parameter].split(','))[:limit]
      ]
    except:
      self.abort(400, detail='Could not parse %s' % (parameter))
    return eids

  def parse_start_end(self):
    """Parses parameters from comma-separated integer list format."""
    try:
      start = [int(x) for x in (self.request.GET["eid1"].split(","))[:50]]
      end = [int(x) for x in (self.request.GET["eid2"].split(","))[:50]]
      return start, end
    except:
      self.abort(400, detail='Could not parse start and/or end eIDs')

  def _add_entity_info_to_vertices(self, vertices):
    """Endows vertices with information about their entities."""

    # No work to be done if the subgraph is empty. This is necessary
    # as PostgreSQL does not handle an empty WHERE IN clause.
    if len(vertices) == 0:
      return

    db = webapp2.get_app().registry['db']
    vertices_eids = [v['eid'] for v in vertices]
    q = """
        SELECT
          entities.id AS eid,
          entities.name,
          entity_flags.trade_with_government AS trade_with_government,
          entity_flags.political_entity AS political_entity,
          entity_flags.contact_with_politics AS contact_with_politics
        FROM entities
        LEFT JOIN entity_flags ON entity_flags.eid=entities.id
        WHERE entities.id IN %s;
        """
    q_data = [tuple(vertices_eids)]
    eid_to_entity = {row['eid']: row for row in db.query(q, q_data)}
    for vertex in vertices:
      entity = eid_to_entity[vertex['eid']]
      vertex['entity_name'] = entity['name']
      for key in ['trade_with_government', 'political_entity',
                  'contact_with_politics']:
        vertex[key] = entity[key]

  def returnJSON(self,j):
    self.response.headers['Content-Type'] = 'application/json'
    self.response.write(json.dumps(j, separators=(',',':')))


class Connection(MyServer):
  def get(self):
    start, end = self.parse_start_end()
    relations_old = webapp2.get_app().registry['relations_old']
    response = relations_old.bfs(start, end)
    self.returnJSON(response)


class AShortestPath(MyServer):
  def get(self):
    start, end = self.parse_start_end()
    relations = webapp2.get_app().registry['relations']
    response = relations.bfs(start, end)  # Assumes unit edge lengths!
    self.returnJSON(response)


class ShortestPath(MyServer):
  def get(self):
    start, end = self.parse_start_end()
    relations_old = webapp2.get_app().registry['relations_old']
    response = relations_old.dijkstra(start, end)
    self.returnJSON(response)


class Neighbourhood(MyServer):
  def get(self):
    start = self._parse_eid_list('eid')
    cap = self._parse_int('cap')
    relations_old = webapp2.get_app().registry['relations_old']
    response = relations_old.dijkstra(
      start, [], cap=cap, return_all=True)
    self.returnJSON(response)


class Subgraph(MyServer):
  def get(self):
    relations = webapp2.get_app().registry['relations']

    # Compute the subgraph to return:
    start = self._parse_eid_list('eid1')
    end = self._parse_eid_list('eid2')
    subgraph = relations.subgraph(start, end)

    # Endow returning vertices with entity names (and other info).
    self._add_entity_info_to_vertices(subgraph['vertices'])

    self.returnJSON(subgraph)


class NotableConnections(MyServer):
  """Returns subgraphs of connections to "notable" entities."""

  def get(self):
    relations = webapp2.get_app().registry['relations']
    notable_eids = webapp2.get_app().registry['notable_eids']

    # Parse URL parameters:
    start = self._parse_eid_list('eid')
    radius = self._parse_int('radius', default=6)
    max_nodes_to_explore = self._parse_int(
      'max_explore', default=100000, max_value=1000000)
    target_order = self._parse_int(
      'target_order', default=50, max_value=200)
    max_order = self._parse_int(
      'max_order', default=100, max_value=200)

    # Build subgraph of connections to notable entities:
    subgraph = relations.get_notable_connections_subgraph(
      start, notable_eids, radius, max_nodes_to_explore, target_order,
      max_order)

    # Endow returning vertices with entity names (and other info).
    self._add_entity_info_to_vertices(subgraph['vertices'])

    self.returnJSON(subgraph)


app = webapp2.WSGIApplication([
    ('/connection', Connection),
    ('/a_shortest_path', AShortestPath),
    ('/shortest', ShortestPath),
    ('/neighbourhood', Neighbourhood),
    ('/subgraph', Subgraph),
    ('/notable_connections', NotableConnections),
], debug=False)


def _initialise_relations(db, max_relations_to_load):
  """Returns Relations object build from edges in database `db`."""

  # Retrieve list of relationship edges:
  q = """
      SELECT eid, eid_relation, stakeholder_type_id
      FROM related WHERE eid <> eid_relation
      LIMIT %s;
      """
  q_data = [max_relations_to_load]
  edge_list = []
  for row in db.query(q, q_data):
    edge_type = row['stakeholder_type_id'] or 0
    edge_list.append(
      (row['eid'], row['eid_relation'], +1 * edge_type))
    edge_list.append(
      (row['eid_relation'], row['eid'], -1 * edge_type))
  print('[OK] Received %d edges.' % (len(edge_list)))

  # Construct and return Relations object from the edge list:
  return Relations(edge_list)


def _initialise_notable_eids(db):
  """Returns set of eids corresponding to "notable" entities."""

  rows = db.query("""
      SELECT eid FROM entity_flags
      WHERE political_entity=TRUE;
  """)
  notable_eids = set(row["eid"] for row in rows)
  print('[OK] Received %d notable eIDs.' % (len(notable_eids)))
  return notable_eids


def initialise_app(max_relations_to_load, disable_old_database=False):
  """Precomputes values shared across requests to this app.

  The registry property is intended for storing these precomputed
  values, so as to avoid global variables.
  """

  # Connect to the database:
  db = DatabaseConnection(path_config='db_config.yaml')
  schema = db.get_latest_schema('prod_')
  db.execute('SET search_path to ' + schema + ';')
  app.registry['db'] = db

  app.registry['relations'] = _initialise_relations(
    db, max_relations_to_load)
  app.registry['notable_eids'] = _initialise_notable_eids(db)

  # TEMP: For faster unit testing:
  if disable_old_database:
    return

  # TEMP: Construct Relations using old database data:
  db_old = DatabaseConnection(path_config='db_config_old.yaml', search_path='mysql')
  app.registry['db_old'] = db_old
  q = """SELECT eid1, eid2, length FROM related LIMIT %s;"""
  q_data = [max_relations_to_load]
  edge_list_old = []
  for row in db_old.query(q, q_data):
    edge_list_old.append(
      (row['eid1'], row['eid2'], float(row['length'])))
    edge_list_old.append(
      (row['eid2'], row['eid1'], float(row['length'])))
  relations_old = Relations(edge_list_old)
  app.registry['relations_old'] = relations_old


def main(args):
  # Initialise the app by precomputing values:
  initialise_app(args.max_relations_to_load)

  # Start the server:
  host, port = args.listen.split(':')
  httpserver.serve(
      app,
      host=host,
      port=port,
      request_queue_size=128,
      use_threadpool=True,
      threadpool_workers=32,
  )


if __name__ == '__main__':
  parser = argparse.ArgumentParser()
  parser.add_argument('--listen',
                      help='host:port to listen on',
                      default='127.0.0.1:8081')
  parser.add_argument('--max_relations_to_load',
                      type=int,
                      help='Maximum # of edges to load from database.',
                      default=123456789)
  args = parser.parse_args()
  main(args)
