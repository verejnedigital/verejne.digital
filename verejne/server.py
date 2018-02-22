#!/usr/bin/env python
# -*- coding: utf-8 -*-
import argparse
import db
import simplejson as json
from paste import httpserver
import sys
import state
import traceback
import webapp2
import yaml

############################
# Config
############################
data_sources = {}

def loadDataSources():
    global data_sources
    with open("datasources.yaml", "r") as stream:
        data_sources = yaml.load(stream)
loadDataSources()

##############################
# Utility functions
##############################

# TODO: add proper logging
def log(s):
    print "LOG: " + s

def errorJSON(code, text):
    d = {"code": code, "message": "ERROR: " + text}
    return d

########################################
# Server state is stored in this class
########################################

entities = state.Entities()

###########################################
# Implemenatation of the server hooks
##########################################
# All individual hooks inherit from this class outputting jsons
# Actual work of subclasses is done in method process.
# TODO: move this to a lib directory
class MyServer(webapp2.RequestHandler):
    def returnJSON(self,j):
        self.response.headers['Content-Type'] = 'application/json'
        self.response.write(json.dumps(j, separators=(',',':')))


class GetEntities(MyServer):
    def get(self):
        try:
            lat1 = float(self.request.GET["lat1"])
            lat2 = float(self.request.GET["lat2"])
            lng1 = float(self.request.GET["lng1"])
            lng2 = float(self.request.GET["lng2"])
            restrictToSlovakia = bool(
                    self.request.GET.get("restrictToSlovakia", False))
            level = int(self.request.GET.get("level", 3))
        except:
            self.returnJSON(errorJSON(400, "Inputs are not floating points"))
            return

        if (level == 0) and ((lat2 - lat1) + (lng2 - lng1) > 2):
            self.returnJSON(errorJSON(400, 
                        "Requested area is too large. If you want to download "
                        "data for your own use, please contact us on Facebook."))
            return

        self.response.headers['Content-Type'] = 'application/json'
        entities.getEntities(
                self.response, lat1, lng1, lat2, lng2, level, restrictToSlovakia)
  
class GetRelated(MyServer):
    def get(self):
       try:
           eid = int(self.request.GET["eid"])
       except:
           self.returnJSON(errorJSON(400, "Input is not an integer"))
           return
       self.returnJSON(entities.getRelated(eid)) 

# Read info from all info tables and returns all related entities for the given eid
class GetInfo(MyServer):
    def get(self):
        global data_sources
        try:
            eid = int(self.request.GET["eid"])
        except:
            self.returnJSON(errorJSON(400, "Input is not an integer"))
            return

        # Copy total sum of contracts if present
        result = {}
        if eid in entities.eid_to_index:
            entity = entities.entities[entities.eid_to_index[eid]]
            result["total_contracts"] = entity.contracts

        # load info data from individual tables
        for table in data_sources:
            print "Processing table", table
            columns = ",".join(data_sources[table])
            sql = "SELECT DISTINCT " + columns + " FROM entities"
            if (table != "entities"):
                sql += " JOIN " + table + " ON " + "entities.id=" + table + ".id"
            sql += " WHERE entities.eid=%s"
            with db.getCursor() as cur:
                cur = db.execute(cur, sql, [eid])
                current = []
                for row in cur:
                    # TODO: is this needed?
                    r = {key: row[key] for key in row}
                    current.append(r)
                result[table] = current

        result["related"] = entities.getRelated(eid)
        self.returnJSON(result)

# Search entity by name
class SearchEntity(MyServer):
    def get(self):
        try:
            text = self.request.GET["text"].encode("utf8")
        except:
            print "unable to parse"
            self.returnJSON(errorJSON(400, "Incorrect input text"))
            return
        with db.getCursor() as cur:
            sql = "SELECT DISTINCT eid AS eid FROM entities " + \
                  "WHERE to_tsvector('unaccent', entity_name) @@ plainto_tsquery('unaccent', %s) " + \
                  "LIMIT 20"
            cur = db.execute(cur, sql, [text])
            result = []
            for row in cur:
                try:
                    result.append({"eid": row["eid"]})
                except:
                    pass
            self.returnJSON(result)

class SearchEntityByNameAndAddress(MyServer):
    """ Server hook allowing to search for entities by name and address
        (given in text format). Returns a list of dictionaries, with each
        dictionary of the form {'eid': 123456}. """
    def get(self):
        # Parse input
        try:
            firstname = self.request.GET["firstname"].encode("utf8")
            surname = self.request.GET["surname"].encode("utf8")
            address = self.request.GET["address"].encode("utf8")
        except:
            print("SearchEntityByNameAndAddress: Unable to parse input")
            self.returnJSON(errorJSON(400, "Incorrect input text"))
            return

        # Carry-out the logic
        q = """
            SELECT DISTINCT
                eid AS eid
            FROM
                entities
            WHERE
                to_tsvector('unaccent', entity_name) @@ plainto_tsquery('unaccent', %s)
                AND
                to_tsvector('unaccent', address) @@ plainto_tsquery('unaccent', %s)
            LIMIT 20;
            """
        with db.getCursor() as cur:
            cur = db.execute(cur, q, (firstname + ' ' + surname, address))
            result = []
            for row in cur:
                try:
                    result.append({"eid": row["eid"]})
                except:
                    pass
            self.returnJSON(result)

# For given ico, find the corresponding eid and redirect to to its url.
# If no matching entity found redirect to default
class IcoRedirect(MyServer):
    def getEidForIco(self, ico):
        def getForTable(table):
            sql = "SELECT eid FROM " + table + \
                  " JOIN entities ON entities.id = " + table + ".id" + \
                  " WHERE ico = %s" + \
                  " LIMIT 1"
            with db.getCursor() as cur:
                cur = db.execute(cur, sql, [ico])
                row = cur.fetchone()
                if row is None: return None
                return row["eid"]

        eid = None
        eid = getForTable("new_orsr_data")
        if eid is None: eid = getForTable("firmy_data")
        if eid is None: eid = getForTable("orsresd_data")
        return eid

    def get(self):
        try:
            ico = int(self.request.GET["ico"])
        except:
            self.returnJSON(errorJSON(400, "Incorrect input ico"))
            return
        eid = self.getEidForIco(ico)
        log("icoredirect " + str(ico) + " " + str(eid))
        if (eid is None) or (not eid in entities.eid_to_index):
            return self.redirect("/")
        entity = entities.entities[entities.eid_to_index[eid]]
        return self.redirect("/?zobraz&%.7f&%.7f&%d" % (entity.lat, entity.lng, eid))

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--listen',
                        default='127.0.0.1:8080',
                        help='host:port to listen on')
    parser.add_argument('--serving_directory',
                        default='/data/www/verejne.digital/serving/prod/',
                        help='Directory with serving data')
    args = parser.parse_args()

    entities.loadFromDirectory(args.serving_directory)
    host, port = args.listen.split(':')

    app = webapp2.WSGIApplication(
            [
                ('/getEntities', GetEntities),
                ('/getInfo', GetInfo),
                ('/getRelated', GetRelated),
                ('/ico', IcoRedirect),
                ('/searchEntity', SearchEntity),
                ('/searchEntityByNameAndAddress', SearchEntityByNameAndAddress),
            ], debug=False)

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
