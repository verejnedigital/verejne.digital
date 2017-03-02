#!/usr/bin/env python
# -*- coding: utf-8 -*-
from data_model import Obstaravanie, Firma, Candidate, Prediction, RawNotice, LastSync, MakeSession, Session
from utils import obstaravanieToJson, getEidForIco

from sqlalchemy import Column, Float, Integer, String, Boolean, and_
from ast import literal_eval
import csv
from dateutil.parser import parse
from gensim import corpora, models, similarities
import htmlmin
import logging
import numpy as np
from optparse import OptionParser
import os
import re
import sqlite3
import time
import urllib2
import xml.etree.ElementTree as ET
import resource
import urllib, json
from jinja2 import Template
# Dirty hack to improt from parent directory. TODO packaging...
from os import sys, path
sys.path.append(path.dirname(path.dirname(path.abspath(__file__))))
import db
from db import parser
logging.basicConfig(format='%(asctime)s : %(levelname)s : %(message)s', level=logging.INFO)

#parser = OptionParser()
parser.add_argument("--download_datanest", action="store_true")
parser.add_argument("--data_url", default="http://datanest.fair-play.sk/api/dataset_records?dataset_id=77")
parser.add_argument("--create_data_files", action="store_true")
parser.add_argument("--update_platforma", action="store_true")
parser.add_argument("--update_platforma_all", action="store_true")
parser.add_argument("--create_model", action="store_true")
parser.add_argument("--use_lsi", action="store_true")
parser.add_argument("--max_document_frequency", default=0.037)
parser.add_argument("--min_document_occurence", default=15)
parser.add_argument("--model_size", default=100)
parser.add_argument("--compute_predictions", action="store_true")
parser.add_argument("--delete_predictions", action="store_true")
parser.add_argument("--num_predictions", default=10000)
parser.add_argument("--num_candidates", default=20)
parser.add_argument("--compute_estimates", action="store_true")
parser.add_argument("--min_score", default=0.3)
parser.add_argument("--generate_json", action="store_true")
parser.add_argument("--json_name", default="table.json")
parser.add_argument("--generate_companies", action="store_true")
parser.add_argument("--companies_json_name", default="companies.json")
parser.add_argument("--generate_table", action="store_true")
parser.add_argument("--table_name", default="../frontend/obstaravania.html")
parser.add_argument("--companies_table_name", default="../frontend/obstaravania-firmy.html")
parser.add_argument("--min_year", default=2016)
parser.add_argument("--log_titles", action="store_true")
# TODO: add download option, ungzip, create sqlite databases,..
options = parser.parse_args()


session = MakeSession()

# returns Firma class from the csv row, using "customer"/"supplier" prefix
def GetCompanyCSV(row, prefix, header):
    name = header.index(prefix + "_name")
    ico = header.index(prefix + "_organisation_code")
    address = header.index(prefix + "_address")
    email = header.index(prefix + "_email")
    company = session.query(Firma).filter_by(ico=row[ico]).first()
    if company is not None: return company
    company = Firma(ico=row[ico], address=row[address],
                    name=row[name], email=row[email])
    return company

def GetCompany(ico, name):
    company = session.query(Firma).filter_by(ico=str(ico)).first()
    if company is not None: return company
    company = Firma(ico=ico, name=name)
    return company

# Converts string "123 456,78" to float 123456.78
def FancyNumberToFloat(s, const=1.0):
    if (s is None) or (len(s) == 0): return None
    return float(s.replace(" ", "").replace(",", ".")) / const

def GetObstaravanie(row, header):
    description = header.index("project_description")
    official_id = header.index("_record_id")#procurement_code")
    title = header.index("project_name")
    obst = session.query(Obstaravanie).filter_by(official_id=row[official_id]).first()
    if obst is not None:
        print "Obst exists", official_id
        return obst
    obst = Obstaravanie(official_id=row[official_id],
                        description=row[description],
                        title=row[title])
    j = dict((key, value) for (key, value) in zip(header, row))
    obst.json = json.dumps(j)

    currency = j["procurement_currency"]
    const = 30.126 if currency != "EUR" else 1.0
    obst.draft_price = FancyNumberToFloat(j["draft_price"], const)
    obst.final_price = FancyNumberToFloat(j["final_price"], const)
    return obst

def GetObstaravanieByContractId(contract_id):
    obst = session.query(Obstaravanie).filter_by(contract_id=contract_id).first()
    if obst is None: return Obstaravanie()
    return obst

if options.download_datanest:
    response = urllib2.urlopen(options.data_url)
    with open("data.csv", "w") as f:
        print "Downloading datanest csv, might take a minute...."
        f.write(response.read())


def unicode_csv_reader(unicode_csv_data, dialect=csv.excel, **kwargs):
    # csv.py doesn't do Unicode; encode temporarily as UTF-8:
    csv_reader = csv.reader(utf_8_encoder(unicode_csv_data),
            dialect=dialect, **kwargs)
    for row in csv_reader:
        # decode UTF-8 back to Unicode, cell by cell:
        yield [unicode(cell, 'utf-8') for cell in row]

def utf_8_encoder(unicode_csv_data):
    for line in unicode_csv_data:
        yield line.decode('utf-8')

def unicode_csv_reader2(utf8_data, dialect=csv.excel, **kwargs):
    csv_reader = csv.reader(utf8_data, dialect=dialect, **kwargs)
    for row in csv_reader:
        yield [unicode(cell, 'utf-8') for cell in row]

if options.create_data_files:
    print "Creating database from datanest data"
    csvfile = open("data.csv", "r")
    with open("data.csv", "r") as csvfile:
        reader = unicode_csv_reader2(csvfile)#csv.reader(csvfile)
        header = reader.next()
        index = 0
        for row in reader:
            supplier = GetCompanyCSV(row, "supplier", header)
            customer = GetCompanyCSV(row, "customer", header)
            obst = GetObstaravanie(row, header)
            obst.winner = supplier
            obst.customer = customer
            if (obst.winner is None): print "is none"
            session.add(obst)
            index += 1
            if (index % 1000 == 0): 
                print index
                session.commit()
    session.commit()

import unicodedata
def strip_accents(s):
    return ''.join(c for c in unicodedata.normalize('NFD', s)
                   if unicodedata.category(c) != 'Mn')

if options.update_platforma:
    # Load RawNotice from datahub / file
    def GetRawNotice(raw_id):
        notice = session.query(RawNotice).filter_by(id=raw_id).first()
        print "Raw notice", raw_id, notice
        if notice is not None:
            response = notice.notice
        else:
            time.sleep(1)
            response = urllib.urlopen(
                    "https://datahub.ekosystem.slovensko.digital/api/data/vvo/raw_notices/" + \
                    str(raw_id)).read()
            raw_notice = RawNotice(id=raw_id, notice=response)
            session.add(raw_notice)
            session.commit()
        entry = json.loads(response)

        if not "body" in entry:
            print "no body in entry"
            return None
        root = ET.fromstring(entry["body"].encode("utf8"))
        return root

   # Returns Value from the first component in the provided list
    def GetComponentValue(root, components):
        if root is None: return None
        for e in root.iter():
            if (e.attrib.get("FormComponentId", None) in components) and \
               ("Value" in e.attrib):
                return e.attrib["Value"].replace("\n", " ")
        return None

    def GetDescription(raw_id):
        root = GetRawNotice(raw_id)
        return GetComponentValue(root, ["opisPredmetuObstaravania", "opisZakazky"])

    def GetFinalPrice(raw_id):
        root = GetRawNotice(raw_id)
        value = GetComponentValue(root, ["rpp_0-konecnaHZ", "stPunkaNajnizsia", "rpp_0-stNajnizsiaPonuka"]) # The uvo.gov.sk folks have even better names than we do...
        print "Price", raw_id, "=", value
        return FancyNumberToFloat(value)

    def GetLastSync():
        last_sync = session.query(LastSync).first()
        if last_sync is None: return "2010-08-12T22:06:58.682810Z"
        return last_sync.last_sync

    def UpdateLastSync(timestamp):
        with Session() as new_session:
            new_session.query(LastSync).delete(synchronize_session=False)
            new_session.commit()

        last_sync = LastSync(last_sync=timestamp)
        session.add(last_sync)
        session.commit()

    processed = 0
    while True:
    #    try:
    #        last_sync = open("last_sync.txt", "r").read()
    #    except:
    #        last_sync = "2010-08-12T22:06:58.682810Z"
        last_sync = GetLastSync()
        url = 'https://datahub.ekosystem.slovensko.digital/api/data/vvo/notices/sync?since=' + \
              last_sync
        print "Download platforma.slovensko.digital data since", last_sync, url
        time.sleep(1)
        response = urllib.urlopen(url)
        data = json.loads(response.read())
        if len(data) <= 1:
          print "Stopping", len(data)
          print data
          break
        for entry in data:
            last_sync = max(last_sync, entry["updated_at"])
            obst = Obstaravanie()
            if ("contract" in entry):
                obst = GetObstaravanieByContractId(int(entry["contract"]["id"]))
                obst.contract_id = int(entry["contract"]["id"])
            if ("raw_notice_id" in entry):
                if (obst.description is None):
                    desc = GetDescription(int(entry["raw_notice_id"]))
                    if (desc is not None): obst.description = desc
                else:
                     print "Skipping raw_notice, already has description"
            if ("title" in entry): obst.title = entry["title"]
            if ("bulletin_issue" in entry):
                bullet = entry["bulletin_issue"]
                obst.bulletin_year = bullet["year"]
                obst.bulleting_number = bullet["number"]
                obst.bulletin_id = bullet["id"]
            if ("estimated_value_amount" in entry):
                obst.draft_price = FancyNumberToFloat(entry["estimated_value_amount"])
            if ("notice_type" in entry):
                # TODO: 191
                if (int(entry["notice_type"]["id"])==198): obst.finished = True
                if ("name" in entry["notice_type"]):
                    n = entry["notice_type"]["name"]
                    s = strip_accents(n)
                    if ("vysledok" in s) or ("vysledk" in s):
                        obst.finished = True 
                        obst.final_price = GetFinalPrice(int(entry["raw_notice_id"]))
            obst.ekosystem_id = entry["id"]
            obst.json = json.dumps(entry)
            obst.customer = GetCompany(entry["contracting_authority_cin"],
                                       entry["contracting_authority_name"])
            if len(entry["suppliers"]) > 0:
                # TODO: currently we support only one supplier
                supplier = entry["suppliers"][0]
                obst.winner = GetCompany(supplier["cin"], supplier["name"])
            session.add(obst)
            session.commit()
            processed += 1
            if (processed % 25 == 0): print processed
        print last_sync
        UpdateLastSync(last_sync)
#        print >>open("last_sync.txt", "w"), last_sync
        if not options.update_platforma_all: break


def normalizeText(text):
    text = text.lower()
    if not (text.isalpha() == True):
        return ""
    if (len(text) == 1): return ""
    if (len(text) >= 2):
        if (text[-2:] in ["ym", "im", "ov", "om"]): return text[:-2]
    if (len(text) > 2) and (text[-3:] == "ych"): return text[:-3]
    while (len(text)>=1) and (text[-1] in ['a', 'e', 'i', 'o', 'u', 'y']):
        text = text[:-1]
    return text

stop_words = set()
for s in open("stop_words.txt"):
    stop_words.add(s[:-2])
stop_words.add("a")

skip_norms = set()
for s in open("skip_norms.txt").readlines():
    skip_norms.add(s[:-1])

print skip_norms

# Transforms a string into list of normalized words, ignoring normalized words
# occuring in removeWords
def processDocument(document, removeWords):
    l = [normalizeText(strip_accents(word)) for word in document.lower().split()
         if (word not in stop_words)]
    return [w for w in l if (len(w) > 2) and (w not in skip_norms) and (w not in removeWords)]

# Transforms obstaravanie title and description into list of normalized words
def processObstaravanie(obstaravanie):

    def removePunctuation(s):
        return s.replace(".", " ").replace(",", " ").replace(": ", " ")

    customer_words = processDocument(
            removePunctuation(obstaravanie.customer.name), [])

    return processDocument(removePunctuation(obstaravanie.title) + " " + \
                           removePunctuation(obstaravanie.description),
                           customer_words)

if options.create_model:
    # TODO: stemming / lemmatization?!?
    print "Loading texts"
    texts = [processObstaravanie(obstaravanie)
             for obstaravanie in
             session.query(Obstaravanie).filter(Obstaravanie.description.isnot(None))]

    print "Loading done"
    dictionary = corpora.Dictionary(texts)
    dictionary.filter_extremes(
            no_below=int(options.min_document_occurence),
            no_above=float(options.max_document_frequency), keep_n=99999999)
# TODO: rename lines.dict to dictionary.dict
    dictionary.save('lines.dict')
    print(dictionary)
    corpus = [dictionary.doc2bow(line) for line in texts]
    if options.use_lsi:
        lsi = models.LsiModel(corpus, id2word=dictionary, num_topics=options.model_size)
        lsi.print_topics(options.model_size)
    else:
        lsi = models.TfidfModel(corpus)
    lsi.save('model.lsi')

if options.compute_predictions:
    suppliers = []
    ids = []
    corpus = []

    dictionary = corpora.Dictionary.load('lines.dict')
    print "Loading data"
    for obstaravanie in session.query(Obstaravanie).order_by(-Obstaravanie.id):
        if (obstaravanie.winner is None): continue
        if (obstaravanie.description is None): continue
        corpus.append(dictionary.doc2bow(processObstaravanie(obstaravanie)))
        suppliers.append(obstaravanie.winner_id)
        ids.append(obstaravanie.id)
   
    if options.use_lsi:
        lsi = models.LsiModel.load('model.lsi') 
    else:
        lsi = models.TfidfModel.load('model.lsi')
    index = similarities.Similarity('shards/', lsi[corpus], num_features=len(dictionary.values()))
    processed = 0
    # process last num_lines entries
    # table with generated suggestions
    table = []
    print "Computing candidates"
    new_session = Session()
    if options.delete_predictions:
        new_session.query(Candidate).delete(synchronize_session=False)
        new_session.commit()
    min_score = float(options.min_score)
    results = []
    generated_predictions = 0
    last_generated_bulletin = -1
    for obstaravanie in session.query(Obstaravanie). \
        filter(and_(Obstaravanie.bulletin_year.isnot(None),
                    Obstaravanie.bulleting_number.isnot(None))). \
        order_by(-Obstaravanie.bulletin_year,-Obstaravanie.bulleting_number):

        if (generated_predictions >= int(options.num_predictions)): break
        if (obstaravanie.bulletin_year < int(options.min_year)):
            print "year too low", obstaravanie.bulletin_year
            break

        if (last_generated_bulletin != -1) and (obstaravanie.bulletin_id != last_generated_bulletin):
          print "Finished processing bulletin"
          break

        if (not options.delete_predictions) and \
            ((obstaravanie.candidates is not None) and (len(obstaravanie.candidates)) > 0):
            print "already has candidates"
            if (options.log_titles): print obstaravanie.title
            last_generated_bulletin = obstaravanie.bulletin_id
            continue
 
        processed += 1
        if (processed % 1 == 0):
            print "Processed", processed, "generated predictions", generated_predictions
        if (obstaravanie.description is None):
            print "Description is none"
            if (options.log_titles): print obstaravanie.title
            continue 
        if (obstaravanie.winner is not None):
            print "Skipping, has winner"
            if (options.log_titles): obstaravanie.winner.__dict__
            continue
        if (obstaravanie.finished is not None):
            print "Skipping, is finished"
            if (options.log_titles): print obstaravanie.title
            continue

       # compute cosine similarities to the text
        line = processObstaravanie(obstaravanie)
        vec_bow = dictionary.doc2bow(line)
        vec_lsi = lsi[vec_bow]
        sims = index[vec_lsi]
        sims = sorted(enumerate(sims), key=lambda item: -item[1])
        predicted = set()
        
        for (line_index, value) in sims:
            winner = suppliers[line_index]
            if winner in predicted: continue
            if (value < min_score): break
            new_session.add(Candidate(score=float(value), obstaravanie_id=obstaravanie.id,
                                      company_id=winner,
                                      reason_id=ids[line_index]))
            new_session.commit()
            predicted.add(winner)
            if (len(predicted) >= int(options.num_candidates)): break
        if (len(predicted)>0): generated_predictions += 1

if options.compute_estimates:
    print "computing estimates"
    new_session = Session()
    new_session.query(Prediction).delete(synchronize_session=False)
    new_session.commit()
    generated = 0
    for obstaravanie in session.query(Obstaravanie):
        candidates = obstaravanie.candidates
        if (candidates is None) or (len(candidates) is None): continue
        estimates = [(candidate.score, candidate.reason.final_price)
                     for candidate in candidates]
        data = filter(lambda x: (x[1] is not None) and (x[1] > 0), estimates)
        if len(data) == 0: continue
        weights = [x[0] for x in data]
        points = np.log([x[1] for x in data])
        # assumming log-normal distribution
        avg = np.average(points, weights=weights)
        variance = np.average((points - avg) ** 2.0, weights=weights)
        stdev = np.sqrt(variance)
        new_session.add(Prediction(mean=float(avg), stdev=float(stdev), num=len(data),
                                   obstaravanie_id=obstaravanie.id))
        new_session.commit()
        generated += 1
        if (generated % 25 == 0): print "Generated estimates", generated

if options.generate_json:
    print "generating json"
    db.connect(False)
    candidates = int(options.num_candidates)

    successes = 0
    valid_rows = 0
    processed = 0
    results = []
    min_score = float(options.min_score)
    generated_predictions = 0
    for obstaravanie in session.query(Obstaravanie). \
        filter(and_(Obstaravanie.bulletin_year.isnot(None),
                    Obstaravanie.bulleting_number.isnot(None))). \
        order_by(-Obstaravanie.bulletin_year,-Obstaravanie.bulleting_number):
        if (generated_predictions >= int(options.num_predictions)): break
        if (obstaravanie.bulletin_year < int(options.min_year)):
            print "year too low", obstaravanie.bulletin_year
            break

        processed += 1
        if (processed % 25 == 0):
            print "Processed", processed, "generated predictions", generated_predictions
        if obstaravanie.candidates is None: 
            print "candidates is none"
            continue
        if len(obstaravanie.candidates) == 0:
            print "candidates is empty"
            continue

        generated_predictions += 1
        results.append(obstaravanieToJson(obstaravanie, candidates, 1))
    open(options.json_name, "w").write(json.dumps(results))

if options.generate_companies:
    print "generating json"
    db.connect(False)
    candidates = int(options.num_candidates)

    successes = 0
    valid_rows = 0
    processed = 0
    results = []
    min_score = float(options.min_score)
    generated_predictions = 0
    this_company = {}
    last_company_id = -1
    for candidate in session.query(Candidate). \
        order_by(Candidate.company_id, -Candidate.score):
        if (generated_predictions >= int(options.num_predictions)): break
        processed += 1
        if (processed % 25 == 0):
            print "Processed", processed, "generated predictions", generated_predictions
        if (candidate.company_id != last_company_id):
            if (last_company_id > 0):
                results.append(this_company)
                generated_predictions += 1
            last_company_id = candidate.company_id
            comp = candidate.company
            this_company = {
                "id": comp.id,
                "name": comp.name,
                "address": comp.address,
                "ico": comp.ico,
                "eid": getEidForIco(comp.ico),
                "candidates": 0}
        this_company["candidates"] += 1
    results.append(this_company)
    results.sort(key=lambda x: -x["candidates"])
    open(options.companies_json_name, "w").write(json.dumps(results))

if options.generate_table:
    print "Generating table"
    with open(options.table_name, "w") as f:
        template = Template(open("obstaravania.tmpl").read().decode("utf8"))
        results = json.loads(open(options.json_name).read())
        s = template.render(obstaravania=results)
        print >>f, htmlmin.minify(s, remove_comments=True, remove_empty_space=True).encode("utf8")
    
    print "Generating companies table"
    with open(options.companies_table_name, "w") as f:
        template = Template(open("firmy.tmpl").read().decode("utf8"))
        results = json.loads(open(options.companies_json_name).read())
        s = template.render(obstaravania=results)
        print >>f, htmlmin.minify(s, remove_comments=True, remove_empty_space=True).encode("utf8")
