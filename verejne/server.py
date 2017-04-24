#!/usr/bin/env python
# -*- coding: utf-8 -*-
import db
import simplejson as json
from paste import httpserver
import sys
import traceback
import unicodedata
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

db.connect(False)
loadDataSources()

##############################
# Utility functions
##############################

# TODO: add proper logging
def log(s):
    print "LOG: " + s

def loadJSONFromFile(filename):
    with open(filename) as data_file:
        return json.load(data_file)

def errorJSON(code, text):
    d = {"code": code, "message": "ERROR: " + text}
    return d

# Since we are caching JSON, this class is used to insert
# cached jsons into JSONs response so that it is not serialized again
# This is hacky
class RawJson(unicode):
    pass

# patch json.encoder module
for name in ['encode_basestring', 'encode_basestring_ascii']: 
    def encode(o, _encode=getattr(json.encoder, name)):
        return o if isinstance(o, RawJson) else _encode(o)
    setattr(json.encoder, name, encode)

# Method to extract name of address of typeName type from
# json[0]["address_components"]
def getComponent(json, typeName):
    try:
        for component in json[0]["address_components"]:
            if typeName in component["types"]:
                return component["long_name"]        
    except:
        return None

# Class storing info about entity (real or synthetic)
# provides utility function for export/processing.
class Entity:
    lat = 0
    lng = 0
    name = ""
    eid = ""
    origin = 0
    size = 0
    address = ""
    slovakia = False # whether the entity is in Slovakia
    isp = False # connected to politics
    contracts = 0 # total sum of contracts
    is_zrsr = False # comming from zrsr
    is_orsr = False # comming from orsr
    
    def getJSON(self):
        ds = [0, 0, 0, 0] 
        if self.size <= 1:
            ds = [self.isp, self.contracts / (self.contracts + 10000.0),
                  1 if self.is_orsr else 0, 1 if self.is_zrsr else 0]

        d = {
            "lat": self.lat,
            "lng": self.lng,
            "name": self.name,
            "eid": self.eid,
            "size": self.size,
            "address": self.address,
            "ds": ds
        }
        if self.size > 1:
            d["lat1"] = self.lat1
            d["lat2"] = self.lat2
            d["lng1"] = self.lng1
            d["lng2"] = self.lng2
        return d;

    def addChild(self, child):
        self.lng *= self.size
        self.lat *= self.size
        self.lng += child.lng
        self.lat += child.lat
        if (self.size == 0 or child.lat < self.lat1): self.lat1 = child.lat
        if (self.size == 0 or child.lat > self.lat2): self.lat2 = child.lat
        if (self.size == 0 or child.lng < self.lng1): self.lng1 = child.lng
        if (self.size == 0 or child.lng > self.lng2): self.lng2 = child.lng
        self.size += 1
        self.lat /= float(self.size)
        self.lng /= float(self.size)

######################################
# Code for grouping entities into cities/subcities/districts
######################################
kOkresName = "Okres: "
kOkolie = ", časť"

def normalizeCityName(name):
    return name.replace(" ", "")

def removeCityAccents(name):
    return ''.join(
            c for c in unicodedata.normalize(
                'NFD', normalizeCityName(name).decode("utf8"))
            if unicodedata.category(c) != 'Mn')

class Entities:
    # The entire state needed for serving:
    # Lists of individual entities and their aggregations at city, district, subcity levels.
    # An inverse map mapping eid to index in entities
    entities = []
    eid_to_index = {}
    sidlaEntity = {}
    okresyEntity = {}
    subcityEntity = {}
    def __init__(self):
        self.initializeHigherEntities()

        entities_to_load = int(db.getConfig()["entities_to_load"])
        log("Entities to load: " + str(entities_to_load))

        # Read all entities from database and populate internal data structure with them.
        self.loadEntities(entities_to_load)
        # sort entities by lat, lng so can easily find segment in a box
        self.entities.sort(key=lambda x: (x.lat, x.lng))
        self.eid_to_index = {}
        index = 0
        for entity in self.entities:
            self.eid_to_index[entity.eid] = index
            index += 1
        self.loadEntitieProperties()
        self.populateHigherEntities()
        self.generateSubcities()
        self.createJSONs()

    # Internal state used while loading cities, districts, ...
    sidlaMapping = {}
    sidloCount = {}
    sidloNoAccentsCount = {}
    noAccToOrig = {}
    # Loads files with cities, districts, etc and creates encapsulating datastructures.
    def initializeHigherEntities(self):
        sidla = loadJSONFromFile(
                "data/sidla.json")["lokacie"] # list of cities in slovakia
        okresy = loadJSONFromFile(
                "data/okresy.json")["lokacie"] # list of districts in slovakia

        # TODO: explain what's going on here
        for sidlo in sidla:
            nazov = normalizeCityName(sidlo["nazov"]["sk"].encode("utf8"))
            self.sidloCount[nazov] = self.sidloCount.get(nazov, 0) + 1
            nazovNoAccents = removeCityAccents(nazov)
            self.sidloNoAccentsCount[nazovNoAccents] = \
                    self.sidloNoAccentsCount.get(nazovNoAccents, 0) + 1
            self.noAccToOrig[nazovNoAccents] = nazov

        self.sidlaEntity = self.createEntities(sidla, "S", "O")
        self.okresyEntity = self.createEntities(okresy, "O", "K", 10)
        self.subcityEntity = {}

        for entity in self.sidlaEntity.values():
            self.sidlaMapping[normalizeCityName(entity.name)] = entity.eid

    def createEntities(self, entity_list, code, parent_code, vlastneId=None):
        result = {}
        for entity in entity_list:
            new_entity = Entity()
            try:
                name = entity["nazov"]["sk"].encode("utf8")
                new_id = code + str(entity["kod"])
                if not vlastneId is None:
                    new_id = code + str(vlastneId)
                    vlastneId += 1
                new_entity.eid = new_id
                new_entity.name = name
                new_entity.parent = parent_code + str(entity["nadradenaLokacia"])
                new_entity.slovakia = True
                result[new_entity.eid] = new_entity
            except:
                log("Problem creating entity " + str(entity))
        return result

    def getSidloId(self, name, lat, lng):
        cnt = self.sidloCount.get(name, 0)
        if (cnt > 1): return None
        if (cnt == 0):
            if (self.sidloNoAccentsCount.get(
                removeCityAccents(name), 2) != 1): return None
            name = self.noAccToOrig[removeCityAccents(name)]
        return self.sidlaMapping.get(name, None)

    def addToCity(self, entity, cityId):
        self.sidlaEntity[cityId].addChild(entity)
        self.okresyEntity[self.sidlaEntity[cityId].parent].addChild(entity)
        entity.parent = cityId

    def populateHigherEntities(self):
        global kOkresName
        # Merging entities into cities, districts,..
        print "Phase 1"
        noMatching = 0
        multipleMatching = 0
        for entity in self.entities:
            if not entity.slovakia: continue
            city = entity.city
            if not city is None:
                city = normalizeCityName(city.encode("utf8"))
                cnt = self.sidloCount.get(city, 0)
                if (cnt == 0): noMatching += 1
                if (cnt > 1): multipleMatching += 1
                cityId = self.getSidloId(city, entity.lat, entity.lng)
                if not cityId is None: self.addToCity(entity, cityId)
                else: log("IS NONE: " + city)
        print "no, mult", noMatching, multipleMatching
   
        print "Phase 2 for cities in multiple regions"
        for entity in self.entities:
            if not entity.slovakia: continue
            city = entity.city
            if not city is None:
                city = normalizeCityName(city.encode("utf8"))
                cnt = self.sidloCount.get(city, 0)
                if (cnt > 1):
                    closestName = ""
                    closestEid = ""
                    closestDst = 1000000
                    for okres in self.okresyEntity.values():
                        dst = (okres.lat - entity.lat) ** 2 + (okres.lng - entity.lng) ** 2
                        if (dst < closestDst):
                            closestDst = dst
                            closestEid = okres.eid
                            closestName = okres.name
                    print "Matched", city, closestName
                    for sidlo in self.sidlaEntity.values():
                        if city == sidlo.name and closestEid == sidlo.parent:
                            self.addToCity(entity, sidlo.eid)
                            print "Matching multiple", city, sidlo.parent, sidlo.eid

        for okres in self.okresyEntity.values():
            okres.maxSize = -1
            okres.name = kOkresName + okres.name
            okres.slovakia = True
        
        for sidlo in self.sidlaEntity.values():
            parent = self.okresyEntity[sidlo.parent]
            if sidlo.size > parent.maxSize:
                parent.lat = sidlo.lat
                parent.lng = sidlo.lng
                parent.maxSize = sidlo.size

        print "Phase 3, outside Slovakia"
        outsideCities = {}
        outsideOkres = {}
        for entity in self.entities:
            if entity.slovakia: continue
            city = entity.city
            country = entity.country
            if country is None: continue
            country_entity = outsideOkres.get(country, Entity())
            country_entity.addChild(entity)
            country_entity.eid = country
            country_entity.name = str(country.encode("utf8"))
            outsideOkres[country] = country_entity
            if city is None: continue
            new_entity = outsideCities.get((city, country), Entity())
            new_entity.addChild(entity)
            new_entity.name = city
            new_entity.eid = str(city.encode("utf8")) + "|" + str(country.encode("utf8"))
            outsideCities[(city, country)] = new_entity

        # Hack: show only big cities
        print "Keeping only big cities"
        outsideOkres = {}
        for entity in outsideCities.values():
            if entity.size >= 10:
                outsideOkres[entity.eid] = entity

        self.sidlaEntity.update(outsideCities)
        self.okresyEntity.update(outsideOkres)
    
    #Loads batch_size number of entities from database, skipping first from_index entries
    #and populates internal database with them
    #Returns True if processed some entities.
    def loadEntities(self, batch_size):
        cur = db.getCursor()
        db.execute(cur, "SELECT eid, entity_name, lat, lng, json, address " +
                        "FROM entities " +
                        "WHERE (entity_name IS NOT NULL) AND " +
                        "      (entity_name != '') AND " +
                        "      (has_data IS NOT NULL)" + \
                        "LIMIT %s", [batch_size])
       
        for row in cur:
            # if multiple rows share common eid, use only the first one
            # TODO: use the most recent address
            if (row["eid"] in self.eid_to_index): continue
            j = json.loads(row["json"])
            entity = Entity()
            country = getComponent(j, "country")
            entity.country = country
            entity.slovakia = (entity.country == "Slovakia")
            entity.eid = row["eid"]
            entity.lat = float(row["lat"])
            entity.lng = float(row["lng"])
            entity.name = row["entity_name"].decode("utf8")
            address = row["address"].decode("utf8")
            if country is not None:
                address = address.replace(", " + country, "")
            psc = getComponent(j, "postal_code")
            if psc is not None:
                address = address.replace(psc + " ", "")
            entity.address = address
            entity.origin = 0
            entity.size = 1
            try:
                city = getComponent(j, "locality")
                entity.city = city
            except:
                entity.city = None
               
            self.entities.append(entity)
            num_entities = len(self.entities) 
            # Debug output entity json
            if (num_entities % 30000 == 0):
                print json.dumps(json.loads(row["json"]), indent=4)
            self.eid_to_index[entity.eid] = num_entities
        cur.close()

    # Sets the given attribute with the value of the given column. The sql returns
    # results in two columns: 'eid' and 'column'. If mapping is not null, assigns
    # mapping(column)
    def loadExtra(self, sql, column, attribute, mapping=None):
        log("loadExtra " + column + ", " + attribute)
        with db.getCursor() as cur:
            cur = db.execute(cur, sql)
            for row in cur:
                eid = row["eid"]
                if not eid in self.eid_to_index: continue
                value = row[column]
                if mapping is not None: value = mapping(value)
                setattr(self.entities[self.eid_to_index[eid]],
                        attribute, value)

    # loads all properties associated with entities. E.g, original datasource,
    # sum of contracts, connected to politics,...
    def loadEntitieProperties(self):
        log("loadEntitieProperties")
        if not (db.getConfig()["load_extra"]): return
        with open("sqls.yaml", "r") as stream:
            sqls = yaml.load(stream)
            self.loadExtra(sqls["contracts"], "total", "contracts",
                           lambda x: float(x))
            self.loadExtra(sqls["is_politician"], "is_politician", "isp")
            self.loadExtra(sqls["is_zrsr"], "is_zrsr", "is_zrsr")
            self.loadExtra(sqls["is_orsr"], "is_orsr", "is_orsr")

    # Generate subcities: the layer between the individual entities and cities.
    def generateSubcities(self):
        global kOkolie
        print "generateSubcities"

        prelim = {}
        for entity in self.entities:
            try:
                parent = self.sidlaEntity[entity.parent]
            except:
                continue
            lat = int((entity.lat - parent.lat) * 26.0)
            lng = int((entity.lng - parent.lng) * 26.0)
            key = (entity.parent, lat, lng)
            new_entity = prelim.get(key, Entity())
            new_entity.name = self.sidlaEntity[entity.parent].name 
            new_entity.eid = str(entity.parent) + "," + str(lat) + ", " + str(lng)
            new_entity.addChild(entity)
            prelim[key] = new_entity

        for key in prelim:
            entity = prelim[key]
            entity.name += kOkolie
            self.subcityEntity[key] = entity

    # For all entities, populates the field .json with string serialization of
    # the json representation of the entity
    def createJSONs(self):
        def processList(entity_list):
            for entity in entity_list:
                if not ((entity.address == "") and (entity.name == "")):
                    entity.json = json.dumps(entity.getJSON(), separators=(',',':'))
                    entity.address = ""
                    entity.name = ""
                    entity.eid = ""
        log("createJSONs")
        processList(self.entities)
        processList(self.subcityEntity.values())
        processList(self.sidlaEntity.values())
        processList(self.okresyEntity.values())

    # Returns all entities within the given bounding box at the given level
    # level == 0 -> entities
    # level == 1 -> subcities
    # level == 2 -> cities
    # level == 3 -> okresy
    # If more entities share the same location, all are returned individually.
    # For level = 0, the returned entities are sorted by (lat, lng).
    # The entities list is directly written to the response field to save on
    # json serialization and copying
    def getEntities(
            self, response, lat1, lng1, lat2, lng2, level, restrictToSlovakia):
        result = []
        inputs = []
        if (level == 0):
            #since entities are sorted, find the first possible point
            data = self.entities#[from_point:]
            # binary search first point so that [0, left) < lat1 <= [right, )
            left, right = 0, len(data)
            while left < right:
                mid = (left + right) / 2
                if data[mid].lat < lat1: left = mid + 1
                else: right = mid
            inputs = data[left:]
        if (level == 1): inputs = self.subcityEntity.values()
        if (level == 2): inputs = self.sidlaEntity.values()
        if (level == 3): inputs = self.okresyEntity.values() 
        response.write("[")
        first = True
        for entity in inputs:
            if (level == 0) and (entity.lat > lat2): break # entities are sorted, so this is fine
            if (restrictToSlovakia and (not entity.slovakia)): continue
            if ((lat1 <= entity.lat) and (entity.lat <= lat2) and
                (lng1 <= entity.lng) and (entity.lng <= lng2) and (entity.size > 0)):
                if first: first = False
                else: response.write(",")
                response.write(entity.json)
        response.write("]")

    # Returns entities ([json]) of all entitities related to the one with given eid
    def getRelated(self, eid):
        with db.getCursor() as cur:
            indices = set()
            cur = db.execute(cur, "(select distinct eid1 as eid from related where eid2=%s and " \
                + "eid2!=eid1) union (select distinct eid2 as eid from related where eid1=%s and eid2!=eid1)", [eid, eid])
            for row in cur:
                indices.add(row["eid"])
            result = [RawJson(self.entities[self.eid_to_index[index]].json)
                      for index in indices if index in self.eid_to_index]
            return result

entities = Entities()

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

    def get(self):
        try:
            self.process()
        except:
            self.returnJSON(errorJSON(
                500, "Internal server error: sa mi neda vycentrovat!"))
            traceback.print_exc(file=sys.stdout)

class GetEntities(MyServer):
    def process(self):
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
    def process(self):
       try:
           eid = int(self.request.GET["eid"])
       except:
           self.returnJSON(errorJSON(400, "Input is not an integer"))
           return
       if str(eid)[0].isdigit(): 
           self.returnJSON(entities.getRelated(eid)) 
           return
       self.returnJSON(errorJSON(400, "Not an entity id"))

# Read info from all info tables and returns all related entities for the given eid
class GetInfo(MyServer):
    def process(self):
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
        return self.returnJSON(result)

# Search entity by name
class SearchEntity(MyServer):
    def process(self):
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
            return self.returnJSON(result)

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

    def process(self):
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
    app = webapp2.WSGIApplication(
            [
                ('/getEntities', GetEntities),
                ('/getInfo', GetInfo),
                ('/getRelated', GetRelated),
                ('/ico', IcoRedirect),
                ('/searchEntity', SearchEntity),
            ], debug=False)

    httpserver.serve(
        app,
        host='127.0.0.1',
        port='8088',
        use_threadpool=True)
  
if __name__ == '__main__':
  main()
