# -*- coding: utf-8 -*-
from data_model import Firma, Obstaravanie, Firma, Candidate, Notification
import db
from dateutil.parser import parse
import json
import matplotlib.pyplot as plt
from matplotlib.backends.backend_pdf import PdfPages
import requests
from requests_toolbelt.multipart.encoder import MultipartEncoder
import yaml
import zipfile

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
        with db.getCursor() as cur:
            sql = "SELECT ico, lat, lng FROM " + table + \
                  " JOIN entities on entities.id = " + table + ".id" + \
                  " WHERE ico IS NOT NULL"
            db.execute(cur, sql)
            for row in cur: output_map[int(row["ico"])] = (row["lat"], row["lng"])
    return output_map

# Returns the value of 'entities.column' for the entitity with 'table'.ico='ico'
def getColumnForTableIco(table, column, ico):
    sql = "SELECT " + column + " FROM " + table + \
          " JOIN entities ON entities.id = " + table + ".id" + \
          " WHERE ico = %s" + \
          " LIMIT 1"
    with db.getCursor() as cur:
        try:
            cur = db.execute(cur, sql, [ico])
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


# Generates report with notifications,
# saving pdf file to filename
def generateReport(notifications, filename):
    pp = PdfPages(filename)
    fig = plt.figure(figsize=(11.69,8.27)) #A4 paper size
    fig.suptitle('Hello world', fontsize=28, fontweight='bold')
    plt.savefig(pp, format='pdf')
    pp.close()

    with zipfile.ZipFile('/tmp/report.zip', 'w') as z:
        z.write(filename)

    # For now, create a dummy sender.
    sender = {
            "company": "ACME",
            "name": "Jozko",
            "surname": "Mrkvicka",
            "address": "Zurichova 73",
            "city": "Bratislava-Vrakuna",
            "country": "SK",
            "zip": "82101"
    }

    company = notifications[0].candidate.company
    recipient = {
            "company": company.name,
            "name": "",
            "surname": "",
            "address": getAddressForIco(company.ico),
            "city": "Slovensko",
            "country": "SK",
            "zip": "82101"
    }

    metadata = {
            "bundle": {
                "delivery": [{
                    "deliveryId": notifications[0].id,
                    "sender": sender,
                    "recipient": recipient,
                    "files": ["report.pdf"]
                }]
            }
    }

    headers = {"Content-Type": "multipart/form-data"}
    with open("/tmp/zelena_posta.yaml", "r") as stream:
        config = yaml.load(stream)
        print "config", config
    with open('/tmp/report.zip', 'rb') as report_file:
        multipart_data = MultipartEncoder(
            fields=[
                ("oauth_consumer_key", config["key"]),
                ("oauth_signature", config["signature"]),
                ("access_token", config["token"]),
                ("payload", json.dumps(metadata)),
                ("callback", "https://verejne.digital"),
                ("file", ('report.zip', report_file, 'application/zip')),
            ]
        )
        x = multipart_data.to_string()
        r = requests.post("https://www.zelenaposta.sk/online-service/online-printer",
                          data=x,
                          headers={'Content-Type': multipart_data.content_type})
        print r


