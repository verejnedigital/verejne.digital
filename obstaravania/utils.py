# -*- coding: utf-8 -*-
from data_model import Firma, Obstaravanie, Firma, Candidate, Notification
import db_old
from dateutil.parser import parse
import json
import os
import yaml

def NormalizeIco(ico):
    if ico is None: return None
    ico = ico.replace(" ", "")
    try:
      a = int(ico)
      return a
    except:
      return None

def IcoToLatLngMap():
    output_map = {}
    for table in ["orsresd_data", "firmy_data", "new_orsr_data"]:
        with db_old.getCursor() as cur:
            sql = "SELECT ico, lat, lng FROM " + table + \
                  " JOIN entities on entities.id = " + table + ".id" + \
                  " WHERE ico IS NOT NULL"
            db_old.execute(cur, sql)
            for row in cur: output_map[int(row["ico"])] = (row["lat"], row["lng"])
    return output_map

# Returns the value of 'entities.column' for the entitity with 'table'.ico='ico'
def getColumnForTableIco(table, column, ico):
    sql = "SELECT " + column + " FROM " + table + \
          " JOIN entities ON entities.id = " + table + ".id" + \
          " WHERE ico = %s" + \
          " LIMIT 1"
    with db_old.getCursor() as cur:
        try:
            cur = db_old.execute(cur, sql, [ico])
            row = cur.fetchone()
            if row is None: return None
            return row[column]
        except:
            return None

# TODO: refactor as this is also done in server
def getEidForIco(ico):
    ico = NormalizeIco(ico)
    for table in ["new_orsr_data", "firmy_data", "orsresd_data"]:
        value = getColumnForTableIco(table, "eid", ico)
        if value is not None: return value
    return None

def getAddressForIco(ico):
    ico = NormalizeIco(ico)
    for table in ["new_orsr_data", "firmy_data", "orsresd_data"]:
        value = getColumnForTableIco(table, "address", ico)
        if value is not None: return value.decode("utf8")
    return ""

# Returns estimated/final value
def getValue(obstaravanie):
    if (obstaravanie.final_price is not None): return obstaravanie.final_price
    if (obstaravanie.draft_price is not None): return obstaravanie.draft_price
    return None

def obstaravanieToJson(obstaravanie, candidates, full_candidates=1, compute_range=False):
    current = {}
    current["id"] = obstaravanie.id
    if (obstaravanie.description is None):
        current["text"] = "N/A"
    else:
        current["text"] = obstaravanie.description

    if obstaravanie.title is not None:
        current["title"] = obstaravanie.title
    if (obstaravanie.bulletin_year is not None):
        current["bulletin_year"] = obstaravanie.bulletin_year
    if (obstaravanie.bulleting_number is not None):
        current["bulletin_number"] = obstaravanie.bulleting_number
    current["price"] = getValue(obstaravanie)
    predictions = obstaravanie.predictions
    if (predictions is not None) and (len(predictions) > 0):
        prediction = predictions[0]
        current["price_avg"] = prediction.mean
        current["price_stdev"] = prediction.stdev
        current["price_num"] = prediction.num
    if obstaravanie.json is not None:
        j = json.loads(obstaravanie.json)
        if ("bulletin_issue" in j) and ("published_on" in j["bulletin_issue"]):
            bdate = parse(j["bulletin_issue"]["published_on"])
            current["bulletin_day"] = bdate.day
            current["bulletin_month"] = bdate.month
            current["bulletin_date"] = "%d. %s %d" % (bdate.day,
                    [u"január", u"február", u"marec", u"apríl", u"máj", u"jún",
                     u"júl", u"august", u"september", u"október", u"november", u"december"]
                    [bdate.month - 1], bdate.year)
    current["customer"] = obstaravanie.customer.name
    if (candidates > 0):
        # Generate at most one candidate in full, others empty, so we know the count
        current["kandidati"] = [{
            "id": c.reason.id,
            "eid": getEidForIco(c.company.ico),
            "name": c.company.name,
            "ico": c.company.ico,
            "text": c.reason.description,
            "title": c.reason.title,
            "customer": c.reason.customer.name,
            "price": getValue(c.reason),
            "score": c.score} for c in obstaravanie.candidates[:full_candidates]]
        for c in obstaravanie.candidates[full_candidates:candidates]:
            current["kandidati"].append([])
    return current

def getAddressJson(eid):
    # json with all geocoded data
    j = {}
    with db_old.getCursor() as cur:
        cur = db_old.execute(cur, "SELECT json FROM entities WHERE eid=%s", [eid])
        row = cur.fetchone()
        if row is None: return None
        j = json.loads(row["json"])

    # TODO: do not duplicate this with code in verejne/
    def getComponent(json, typeName):
        try:
            for component in json[0]["address_components"]:
                if typeName in component["types"]:
                    return component["long_name"]
            return ""
        except:
            return ""

    # types description: https://developers.google.com/maps/documentation/geocoding/intro#Types
    # street / city can be defined in multiple ways
    address = {
        "street": (
            getComponent(j, "street_address") +
            getComponent(j, "route") +
            getComponent(j, "intersection") +
            " " + getComponent(j, "street_number")
        ),
        "city": getComponent(j, "locality"),
        "zip": getComponent(j, "postal_code"),
        "country": getComponent(j, "country"),
    }
    return address


# Generates report with notifications,
# saving pdf file to filename
def generateReport(notifications):
    # Bail out if no notifications
    if (len(notifications) == 0): return False

    company = notifications[0].candidate.company
    eid = getEidForIco(company.ico)
    if eid is None: return False

    data = {}
    data["company"] = {
            "name": company.name,
            "ico": company.ico,
            "address_full": getAddressForIco(company.ico),
    }
    data["company"].update(getAddressJson(eid))
    notifications_json = []
    for notification in notifications:
        notifications_json.append({
            "reason": obstaravanieToJson(
                notification.candidate.reason, candidates=0, full_candidates=0),
            "what": obstaravanieToJson(
                notification.candidate.obstaravanie, candidates=0, full_candidates=0),
        })

    data["notifications"] = notifications_json

    # Generate .json file atomically into the following directory. It is picked up
    # from there and automatically turned into .pdf and then send.
    shared_path = "/data/notifikacie/in/"
    tmp_filename = shared_path + ("json_%d_%d.tmp" % (eid, os.getpid()))
    final_filename = shared_path + ("data_%d_%d.json" % (eid, os.getpid()))
    with open(tmp_filename, "w") as tmp_file:
        json.dump(data, tmp_file, sort_keys=True, indent=4, separators=(',', ': '))
    os.rename(tmp_filename, final_filename)
    return True
