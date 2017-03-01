#!/usr/bin/env python
# -*- coding: utf-8 -*-
from data_model import Firma, Obstaravanie, Firma, Candidate, Session
import db
from utils import obstaravanieToJson, getEidForIco

from jinja2 import Template
import json
from paste import httpserver
import webapp2

db.connect(False)


class MyServer(webapp2.RequestHandler):
    def returnJSON(self,j):
        self.response.headers['Content-Type'] = 'application/json'
        self.response.write(json.dumps(j, separators=(',',':')))

    def returnError(self, code, message):
        self.response.set_status(code)
        self.returnJSON({'code': code, 'message': 'ERROR: ' + message})

    def get(self):
        try:
            self.process()
        except:
            self.returnError(
                500, "Internal server error: sa mi neda vycentrovat!"))

class ServeObstaravanie(MyServer):
    def process(self):
        try:
            oid = int(self.request.GET["id"])
        except:
            self.returnError(400, "Incorrect id"))
            return

        session = Session()
        obstaravanie = session.query(Obstaravanie).filter_by(id=oid).first()
        if obstaravanie is None:
            self.returnError(400, "No matching id"))
            return
        j = obstaravanieToJson(obstaravanie, 20, 20)
        # TODO: before launching this, move this to load only once
        singleTemplate = Template( open("obstaravanie.tmpl").read().decode("utf8"))
        html = singleTemplate.render(obstaravanie=j)
        self.response.write(html.encode("utf8"))

class ServeCompany(MyServer):
    def process(self):
        try:
            company_id = int(self.request.GET["id"])
        except:
            self.returnError(400, "Incorrect id"))
            return

        session = Session()
        company = session.query(Firma).filter_by(id=company_id).first()
        result = {
            "name": company.name,
            "ico": company.ico,
            "eid": getEidForIco(company.ico)
        }
        candidates = []
        for candidate in session.query(Candidate). \
            filter_by(company_id=company_id). \
            order_by(-Candidate.score):
            candidates.append([
                    candidate.score,
                    obstaravanieToJson(candidate.obstaravanie, candidates=0, full_candidates=0),
                    obstaravanieToJson(candidate.reason, candidates=0, full_candidates=0)
            ])
        result["obstaravania"] = candidates
        singleTemplate = Template(open("firma.tmpl").read().decode("utf8"))
        html = singleTemplate.render(firma=result)
        self.response.write(html.encode("utf8"))

def main():
  app = webapp2.WSGIApplication(
          [
           ('/obstaravanie', ServeObstaravanie),
           ('/obstaravanieFirma', ServeCompany)
          ], debug=False)

  httpserver.serve(
      app,
      host='127.0.0.1',
      port='8082')
  
if __name__ == '__main__':
  main()
