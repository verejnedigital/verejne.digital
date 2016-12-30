# -*- coding: utf-8 -*-
from data_model import Firma, Obstaravanie, Firma, Session
import db

from dateutil.parser import parse
import json

# TODO: refactor as this is also done in server
def getEidForIco(ico):
    def getForTable(table):
        sql = "SELECT eid FROM " + table + \
              " JOIN entities ON entities.id = " + table + ".id" + \
              " WHERE ico = %s" + \
              " LIMIT 1"
        cur = db.getCursor()
        try:
            cur = db.execute(cur, sql, [ico])
            row = cur.fetchone()
            if row is None: return None
            return row["eid"]
        except:
            return None

    if ico is None: return None
    ico = ico.replace(" ", "")
    try:
      a = int(ico)
    except:
      return None
    eid = getForTable("new_orsr_data")
    if eid is None: eid = getForTable("firmy_data")
    if eid is None: eid = getForTable("orsresd_data")
    return eid

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
    current["bulletin_year"] = obstaravanie.bulletin_year
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
                    [u"január", u"február", u"marec", u"apríl", u"máj", u"jún", u"júl", u"august", u"september", u"október", u"november", u"december"][bdate.month - 1], bdate.year)
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

