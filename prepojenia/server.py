#!/usr/bin/env python
# -*- coding: utf-8 -*-
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
        for row in cur.fetchall():
            self.edges.append((row["eid1"], row["eid2"]))
            self.edges.append((row["eid2"], row["eid1"]))
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

class Connection(MyServer):
    def process(self):
        try:
            start = [int(x) for x in (self.request.GET["eid1"].split(","))[:50]]
            end = [int(x) for x in (self.request.GET["eid2"].split(","))[:50]]
        except:
            self.returnJSON(errorJSON(400, "Incorrect input text"))
        return self.returnJSON(relations.bfs(start, end))

def main():
  app = webapp2.WSGIApplication(
          [('/connection', Connection)],
          debug=False)

  httpserver.serve(
      app,
      host='127.0.0.1',
      port='8081')
  
if __name__ == '__main__':
  main()
