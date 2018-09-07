#!/usr/bin/env python
# -*- coding: utf-8 -*-
import argparse
import json
import os
from paste import httpserver
import sys
import webapp2

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../data/db')))
from db import DatabaseConnection

from relations import Relations


# All individual hooks inherit from this class
# Actual work of subclasses is done in method get
class MyServer(webapp2.RequestHandler):
  def returnJSON(self,j):
    self.response.headers['Content-Type'] = 'application/json'
    self.response.write(json.dumps(j, separators=(',',':')))

  def parse_start_end(self):
    """Parses parameters from comma-separated integer list format."""
    try:
      start = [int(x) for x in (self.request.GET["eid1"].split(","))[:50]]
      end = [int(x) for x in (self.request.GET["eid2"].split(","))[:50]]
      return start, end
    except:
      self.abort(400, detail='Could not parse start and/or end eIDs')


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
    try:
      start = [int(x) for x in (self.request.GET['eid'].split(','))[:50]]
      cap = int(self.request.GET['cap'])
    except:
      self.abort(400, detail='Could not parse parameters')
    relations_old = webapp2.get_app().registry['relations_old']
    response = relations_old.dijkstra(start, [], cap=cap, return_all=True)
    self.returnJSON(response)


class Subgraph(MyServer):
  def get(self):
    # Compute the subgraph to return:
    start, end = self.parse_start_end()
    relations = webapp2.get_app().registry['relations']
    max_distance = 4
    tolerance = 1
    response = relations.subgraph(start, end, max_distance, tolerance)

    # Endow returning vertices with corresponding entity names:
    if len(response['vertices']) >= 1:
      db = webapp2.get_app().registry['db']
      vertices_eids = [v['eid'] for v in response['vertices']]
      q = """
          SELECT id AS eid, name FROM entities
          WHERE entities.id IN %s;
          """
      q_data = [tuple(vertices_eids)]
      rows = db.query(q, q_data)
      eid_to_name = {row['eid']: row['name'] for row in rows}
      for vertex in response['vertices']:
        vertex['entity_name'] = eid_to_name[vertex['eid']]

    self.returnJSON(response)


app = webapp2.WSGIApplication([
    ('/connection', Connection),
    ('/a_shortest_path', AShortestPath),
    ('/shortest', ShortestPath),
    ('/neighbourhood', Neighbourhood),
    ('/subgraph', Subgraph),
], debug=False)


def initialise_app(max_relations_to_load):
  """Precomputes values shared across requests to this app.

  The registry property is intended for storing these precomputed
  values, so as to avoid global variables.
  """

  # Connect to the database:
  db = DatabaseConnection(path_config='db_config.yaml')
  schema = db.get_latest_schema('prod_')
  db.execute('SET search_path to ' + schema + ';')
  app.registry['db'] = db

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

  # Construct Relations object from the edge list:
  relations = Relations(edge_list)
  app.registry['relations'] = relations

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
