#!/usr/bin/env python
# -*- coding: utf-8 -*-
import heapq
import json
from paste import httpserver
import psycopg2
import psycopg2.extras
import Queue
import random
import webapp2
import yaml

def log(s):
  print "LOG: " + s

def errorJSON(code, text):
  d = {"code": code, "message": "ERROR: " + text}
  return d

class Relations:
    edges = []
    start_index = {}

    def __init__(self):
        # Connect to database
        log("Connecting to the database")
        with open("db_config.yaml", "r") as stream:
            config = yaml.load(stream)

        db = psycopg2.connect(user=config["user"], dbname=config["db"])
        cur = db.cursor(cursor_factory=psycopg2.extras.DictCursor)
        cur.execute("SET search_path = 'mysql'")

        log("relations constructor")
        sql = "SELECT eid1, eid2 FROM related LIMIT %s"
        cur.execute(sql, [int(config["relations_to_load"])])
        for row in cur:
            self.edges.append((row["eid1"], row["eid2"], 1.0))
            self.edges.append((row["eid2"], row["eid1"], 1.0))
        cur.close()
        db.close()

        log("sorting edges")
        self.edges.sort()
        log("creating start indices")
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

    def dijkstra(self, start, end):
        # If start and end share entities, return the intersection
        common = list(set(start).intersection(set(end)))
        if (len(common)>0): return [common[0]]

        pred = {}
        distances = {}
        h = []

        def add(vertex, d, p):
            # already in the heap with smaller distance; ignore the edge
            if (distances.get(vertex, 999999999) <= d): return
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
        
        if found == -1: return []
        path = []
        cur = found
        while cur != -1:
            path.append(cur)
            cur = pred[cur]
        path.reverse()
        return path

relations = Relations()

# All individual hooks inherit from this class outputting jsons
# Actual work of subclasses is done in method process
class MyServer(webapp2.RequestHandler):
    def returnJSON(self,j):
        self.response.headers['Content-Type'] = 'application/json'
        self.response.write(json.dumps(j, separators=(',',':')))

    def get(self):
        try:
            self.process()
        except:
            self.returnJSON(errorJSON(
                500, "Internal server error: sa mi neda vycentrovat!"))

def parseStartEnd(request):
    try:
        start = [int(x) for x in (request.GET["eid1"].split(","))[:50]]
        end = [int(x) for x in (request.GET["eid2"].split(","))[:50]]
        return start, end
    except:
        return None

class Connection(MyServer):
    def process(self):
        data = parseStartEnd(self.request)
        if data is None: self.returnJSON(errorJSON(400, "Incorrect input text"))
        else: return self.returnJSON(relations.bfs(data[0], data[1]))

class ShortestPath(MyServer):
    def process(self):
        data = parseStartEnd(self.request)
        if data is None: self.returnJSON(errorJSON(400, "Incorrect input text"))
        else: return self.returnJSON(relations.dijkstra(data[0], data[1]))

def main():
  app = webapp2.WSGIApplication([
      ('/connection', Connection),
      ('/shortest', ShortestPath)
      ], debug=False)

  httpserver.serve(
      app,
      host='127.0.0.1',
      port='8081')
  
if __name__ == '__main__':
  main()
