#!/usr/bin/env python
# -*- coding: utf-8 -*-
import argparse
from data_model import Firma, Obstaravanie, Firma, Candidate, Session, Notification, NotificationStatus
import db
from utils import obstaravanieToJson, getEidForIco, generateReport, getAddressForIco
from sqlalchemy import update

from jinja2 import Template
import json
from paste import httpserver
import yaml
import webapp2

db.connect(False)

class MyServer(webapp2.RequestHandler):
    def returnJSON(self,j):
        self.response.headers['Content-Type'] = 'application/json'
        self.response.write(json.dumps(j, separators=(',',':')))

    def returnError(self, code, message):
        self.response.set_status(code)
        self.returnJSON({'code': code, 'message': 'ERROR: ' + message})

class UpdateNotifications(MyServer):
    def get(self):
        self.response.write("update_notifications")
        # As a response, we expect parameters called all_notificationid to
        # specify which notifications are affected. If on_notificationid is also
        # present, that means that the notification is approved.
        approved = []
        declined = []
        for param in self.request.GET.keys():
            if param.startswith("all_") and param[4:].isdigit():
                notification_id = int(param[4:])
                if ("on_" + str(notification_id)) in self.request.GET:
                    approved.append(notification_id)
                else:
                    declined.append(notification_id)
        with Session() as session:
            for_report = []
            for nid in approved:
                notification = session.query(Notification).filter_by(id=nid).first()
                notification.status = NotificationStatus.APPROVED
                self.response.write(notification.candidate.obstaravanie.title)
                for_report.append(notification)
            for nid in declined:
                notification = session.query(Notification).filter_by(id=nid).first()
                notification.status = NotificationStatus.DECLINED

            if generateReport(for_report):
                session.commit()

        self.response.write("Done!")

class ServeNotifications(MyServer):
    def get(self):
        with Session() as session:
            valid = session.query(Notification).\
                    filter_by(status=NotificationStatus.GENERATED).\
                    order_by(Notification.date_generated.desc())

            per_company = {}
            for notification in valid:
                candidate = notification.candidate
                current = {
                        'id': notification.id,
                        'generated': notification.date_generated,
                        'obstaravanie': obstaravanieToJson(candidate.obstaravanie, 0),
                        'reason': obstaravanieToJson(candidate.reason, 0)
                }
                company = candidate.company_id
                if (not company in per_company):
                    per_company[company] = {
                            "name": candidate.company.name,
                            "address": getAddressForIco(candidate.company.ico),
                            "notifications": [],
                            "first_id": candidate.id
                    }
                per_company[company]["notifications"].append(current)

            with open("notifications.tmpl") as f:
                singleTemplate = Template(f.read().decode("utf8"))
            sorted_values = sorted(per_company.values(), key=lambda x: -x["first_id"])
            html = singleTemplate.render(data=sorted_values,
                                         secret=self.request.GET.get("secret", ""))
            self.response.write(html.encode("utf8"))
            
class ServeObstaravanie(MyServer):
    def get(self):
        try:
            oid = int(self.request.GET["id"])
        except:
            self.returnError(400, "Malformed id")
            return

        with Session() as session:
            obstaravanie = session.query(Obstaravanie).filter_by(id=oid).first()
            if obstaravanie is None:
                self.returnError(404, "No matching id")
                return
            j = obstaravanieToJson(obstaravanie, 20, 20)
            # TODO: before launching this, move this to load only once
            with open("obstaravanie.tmpl") as f:
                singleTemplate = Template(f.read().decode("utf8"))
            html = singleTemplate.render(obstaravanie=j)
            self.response.write(html.encode("utf8"))

class InfoObstaravanie(MyServer):
    def get(self):
        try:
            oid = int(self.request.GET["id"])
        except:
            self.returnError(400, "Malformed id")
            return

        with Session() as session:
            obstaravanie = session.query(Obstaravanie).filter_by(id=oid).first()
            if obstaravanie is None:
                self.returnError(404, "No matching id")
                return
            j = obstaravanieToJson(obstaravanie, 20, 20)
            self.returnJSON(j)

class ServeCompany(MyServer):
    def get(self):
        try:
            company_id = int(self.request.GET["id"])
        except:
            self.returnError(400, "Malformed id")
            return
        with Session() as session:
            company = session.query(Firma).filter_by(id=company_id).first()
            if company is None:
                self.returnError(404, 'No matching id')
                return
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
            with open("firma.tmpl") as f:
                singleTemplate = Template(f.read().decode("utf8"))
            html = singleTemplate.render(firma=result)
            self.response.write(html.encode("utf8"))

def main():
  app = webapp2.WSGIApplication(
          [
           ('/obstaravanie', ServeObstaravanie),
           ('/info_obstaravanie', InfoObstaravanie),
           ('/obstaravanieFirma', ServeCompany),
           ('/notifications', ServeNotifications),
           ('/updateNotifications', UpdateNotifications),
          ], debug=False)

  parser = argparse.ArgumentParser()
  parser.add_argument('--listen',
                    help='host:port to listen on',
                    default='127.0.0.1:8082')
  args = parser.parse_args()
  host, port = args.listen.split(':')

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
