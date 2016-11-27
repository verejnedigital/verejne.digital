# -*- coding: utf-8 -*-
# Work being done from here
from data_model import Firma, Obstaravanie, Firma, Candidate, Session

from sqlalchemy import Column, Float, Integer, String, Boolean, and_
from dateutil.parser import parse
import logging
from optparse import OptionParser
import os
import sqlite3
import urllib, json
# Dirty hack to improt from parent directory. TODO packaging...
from os import sys, path
sys.path.append(path.dirname(path.dirname(path.abspath(__file__))))
import db
from db import parser

#parser.add_argument("--download_datanest", action="store_true")
options = parser.parse_args()

db.connect(False)
cur = db.getCursor()

sql = (
        "SELECT ico, trzby2015, zisk2015, datum_vzniku " + \
        "FROM company_stats " + \
        "WHERE trzby2015 IS NOT NULL"
)

cur = db.execute(cur, sql)
data = {}
for row in cur.fetchall():
    ico = int(row["ico"])
    data[ico] = row


print "Number of companies with data", len(data)

session = Session()
cnt = 0
for obstaravanie in session.query(Obstaravanie). \
        filter(and_(Obstaravanie.winner_id.isnot(None),
                    Obstaravanie.bulletin_year>=2015)). \
        order_by(-Obstaravanie.bulletin_year, -Obstaravanie.bulleting_number):
        j = json.loads(obstaravanie.json)
        try:
            value = float(j["estimated_value_amount"])
        except:
            # No amount, skip for now.
            continue
        try:
            ico = int(obstaravanie.winner.ico) # TODO: can have multiple winners...
        except:
            continue
        if ico in data:
            trzby = data[ico]["trzby2015"]
            zisk = data[ico]["zisk2015"]
            if (value > trzby) or (zisk < -value):
                print "Suspicious", obstaravanie.title, obstaravanie.customer.name, \
                    "Vyherca", obstaravanie.winner.name, \
                    "Trzby", data[ico]["trzby2015"], "Zisk", data[ico]["zisk2015"], \
                    "Hodnota: ", value, \
                    "Vestnik", obstaravanie.bulletin_year, obstaravanie.bulleting_number
