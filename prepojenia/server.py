#!/usr/bin/env python
# -*- coding: utf-8 -*-
import argparse
import heapq
import json
import os
from paste import httpserver
import Queue
import random
import sys
import webapp2
import yaml

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../data/db')))
print('Appended %s' % (os.path.abspath(os.path.join(os.path.dirname(__file__), '../data/db'))))
from db import DatabaseConnection


def log(s):
    print('LOG: %s' % (s))

class Relations:
    edges = []
    start_index = {}

    def __init__(self):
        log('Connecting to the database...')
        db = DatabaseConnection(path_config='db_config.yaml', search_path='mysql')
        with open("db_config.yaml", "r") as stream:
            config = yaml.load(stream)

        log('Relations constructor...')
        q = """SELECT eid1, eid2, length FROM related LIMIT %s"""
        q_data = [int(config["relations_to_load"])]
        for row in db.query(q, q_data):
            self.edges.append((row["eid1"], row["eid2"], float(row["length"])))
            self.edges.append((row["eid2"], row["eid1"], float(row["length"])))
        db.close()

        log('Sorting edges...')
        self.edges.sort()
        log('Creating start indices...')
        for i in xrange(len(self.edges)):
            cur = self.edges[i][0]
            if cur in self.start_index: continue
            self.start_index[cur] = i

    def bfs(self, start, end):
        # If start and end share entities, return the intersection
        common = list(set(start).intersection(set(end)))
        if (len(common)>0): return [common[0]]

        # Randomly swap start and end, so in case they are in different
        # components, in half of the cases, the BFS is done in the smaller one.
        swapped = bool(random.getrandbits(1))
        if swapped: start, end = end, start

        q = Queue.Queue()
        pred = {}
        for s in start:
            pred[s] = -1
            q.put(s)

        found = -1
        while (not q.empty()) and (found == -1):
            head = q.get()
            if not (head in self.start_index): continue
            from_index = self.start_index[head]
            for edge_index in xrange(from_index, len(self.edges)):
                edge = self.edges[edge_index]
                if (edge[0] != head): break
                to = edge[1]
                if to in pred: continue
                pred[to] = head
                if to in end: 
                  found = to
                  break
                q.put(to)

        if found==-1: return []
        path = []
        cur = found
        while cur != -1:
            path.append(cur)
            cur = pred[cur]
        if not swapped: path.reverse()
        return path

    # Start exploring from list start. Never explore beyond distance cap.
    # If return_all is True, return distances of all explored vertices from the start set
    # If return_all is False, return the shortest path to a vertex in the list end
    def dijkstra(self, start, end, cap=999999999, return_all=False):
        # If start and end share entities, return the intersection
        common = list(set(start).intersection(set(end)))
        if (len(common)>0): return [common[0]]

        pred = {}
        distances = {}
        h = []

        def add(vertex, d, p):
            # already in the heap with smaller distance; ignore the edge
            if (distances.get(vertex, 999999999) <= d): return
            if (d > cap): return
            pred[vertex] = p
            distances[vertex] = d
            heapq.heappush(h, (d, vertex))

        # add start vertices
        for i in start: add(i, 0, -1)

        found = -1
        while len(h) > 0:
            entry = heapq.heappop(h)
            vertex = entry[1]
            if vertex in end:
                found = vertex
                break
            if not (vertex in self.start_index): continue
            distance = entry[0]
            # Vertex processed at smaller distance; ignore
            if (distance > distances.get(vertex, 999999999)): continue
            from_index = self.start_index[vertex]
            for edge_index in xrange(from_index, len(self.edges)):
                edge = self.edges[edge_index]
                # If outside of edges from the 'vertex'; stop
                if (edge[0] != vertex): break
                add(edge[1], distance + edge[2], vertex)
        
        if return_all: return distances

        if found == -1: return []
        path = []
        cur = found
        while cur != -1:
            path.append(cur)
            cur = pred[cur]
        path.reverse()
        return path

    def subgraph(self, set_A, set_B):
        # Compute distance of each vertex from A and from B
        dists_A = self.dijkstra(set_A, set_B, return_all=True)
        dists_B = self.dijkstra(set_B, set_A, return_all=True)
        dists_AB = [dists_A[v] for v in set_B if v in dists_A]
        if len(dists_AB) == 0:
            return {'vertices': [], 'edges': []}
        dist_AB = min([dists_A[v] for v in set_B if v in dists_A])

        # Determine subgraph's vertices (eIDs)
        vertices_eids = set()
        vertices_eids.update(set_A)
        vertices_eids.update(set_B)
        tolerance = 1
        for v in dists_A:
            if (v in dists_B) and (dists_A[v] + dists_B[v] <= dist_AB + tolerance):
                vertices_eids.add(v)

        # Obtain entity name for chosen vertices
        db = DatabaseConnection(search_path='mysql')
        q = """
            SELECT eid, entity_name FROM entities
            WHERE entities.eid IN %s;
            """
        q_data = (tuple(vertices_eids),)
        rows = db.query(q, q_data)
        db.close()
        eid_to_name = {row['eid']: row['entity_name'] for row in rows}

        # Add entity names and distances to vertices
        vertices = []
        for eid in vertices_eids:
            vertices.append({
                'eid': eid,
                'entity_name': eid_to_name[eid],
                'distance_from_A': dists_A.get(eid, None),
                'distance_from_B': dists_B.get(eid, None),
                })

        # Build subgraph's edges
        edges = []
        for v1, v2, length in self.edges:
            if (v1 in vertices_eids) and (v2 in vertices_eids):
                edges.append((v1, v2, length))

        return {'vertices': vertices, 'edges': edges}

relations = Relations()


# All individual hooks inherit from this class
# Actual work of subclasses is done in method get
class MyServer(webapp2.RequestHandler):
    def returnJSON(self,j):
        self.response.headers['Content-Type'] = 'application/json'
        self.response.write(json.dumps(j, separators=(',',':')))

    def parse_start_end(self):
        """ Utility method to parse parameters in the form
            of two comma-separated lists of integers """
        try:
            start = [int(x) for x in (self.request.GET["eid1"].split(","))[:50]]
            end = [int(x) for x in (self.request.GET["eid2"].split(","))[:50]]
            return start, end
        except:
            self.abort(400, detail='Could not parse start and/or end eIDs')

class Connection(MyServer):
    def get(self):
        start, end = self.parse_start_end()
        response = relations.bfs(start, end)
        self.returnJSON(response)

class ShortestPath(MyServer):
    def get(self):
        start, end = self.parse_start_end()
        response = relations.dijkstra(start, end)
        self.returnJSON(response)

class Neighbourhood(MyServer):
    def get(self):
        try:
            start = [int(x) for x in (self.request.GET["eid"].split(","))[:50]]
            cap = int(self.request.GET["cap"])
        except:
            self.abort(400, detail='Could not parse parameters')
        response = relations.dijkstra(start, [], cap=cap, return_all=True)
        self.returnJSON(response)

class Subgraph(MyServer):
    def get(self):
        start, end = self.parse_start_end()
        response = relations.subgraph(start, end)
        self.returnJSON(response)


app = webapp2.WSGIApplication([
    ('/connection', Connection),
    ('/shortest', ShortestPath),
    ('/neighbourhood', Neighbourhood),
    ('/subgraph', Subgraph),
], debug=False)

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--listen',
                    help='host:port to listen on',
                    default='127.0.0.1:8081')
    args = parser.parse_args()
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
    main()
