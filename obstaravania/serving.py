#!/usr/bin/env python
# -*- coding: utf-8 -*-
import argparse
import json
import os
from paste import httpserver
import sys
import webapp2
from jinja2 import Template

from data_model import Obstaravanie, Session, Notification, NotificationStatus
from utils import obstaravanieToJson, generateReport, getAddressForIco

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../data/db')))
from db import DatabaseConnection


class MyServer(webapp2.RequestHandler):

    def returnJSON(self, j):
        self.response.headers['Content-Type'] = 'application/json'
        self.response.write(json.dumps(j, separators=(',', ':')))


class UpdateNotifications(MyServer):
    def get(self):
        self.response.write("update_notifications")
        # As a response, we expect parameters called all_notificationid to
        # specify which notifications are affected. If on_notificationid is also
        # present, that means that the notification is approved.
        approved = []
        declined = []
        for param in list(self.request.GET.keys()):
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
            valid = session.query(Notification). \
                filter_by(status=NotificationStatus.GENERATED). \
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
                singleTemplate = Template(f.read())
            sorted_values = sorted(list(per_company.values()), key=lambda x: -x["first_id"])
            html = singleTemplate.render(data=sorted_values,
                                         secret=self.request.GET.get("secret", ""))
            self.response.write(html.encode("utf8"))


class ServeObstaravanie(MyServer):

    def __init__(self):
        with open("obstaravanie.tmpl") as f:
            self.singleTemplate = Template(f.read())

    def get(self):
        try:
            oid = int(self.request.GET["id"])
        except:
            self.abort(400, 'Error: Malformed id.')
            assert False

        with Session() as session:
            obstaravanie = session.query(Obstaravanie).filter_by(id=oid).first()
            if obstaravanie is None:
                self.abort(404, 'Error: No matching id.')
            j = obstaravanieToJson(obstaravanie, 20, 20)
            html = self.singleTemplate.render(obstaravanie=j)
            self.response.write(html.encode("utf8"))


class InfoNotice(MyServer):

    def get(self):
        # Parse URL parameters:
        try:
            notice_id = int(self.request.GET['id'])
        except:
            self.abort(400, detail='Could not parse `id` as integer.')
            assert False

        # Request information about notice with the requested `id`:
        db = webapp2.get_app().registry['db']
        rows = db.query(
            """
            SELECT
                eid,
                e1.name,
                supplier_eid,
                e2.name as supplier_name,
                Notices.notice_id,
                contract_id,
                title,
                estimated_value_amount,
                estimated_value_currency,
                Notices.bulletin_issue_id,
                year as bulletin_year,
                number as bulletin_number,
                to_char(published_on,'DD.MM.YYYY') as bulletin_published_on,
                source_url as bulletin_source_url,
                notice_type_id,
                short_description,
                total_final_value_amount,
                total_final_value_currency,
                body,
                best_supplier,
                e3.name as best_supplier_name,
                best_similarity,
                candidates,
                similarities,
                price_est,
                price_est_low,
                price_est_high
            FROM
                Notices
            JOIN
                NoticesExtras
            ON
                Notices.notice_id = NoticesExtras.notice_id
            JOIN
                NoticeBulletins
            ON
                Notices.bulletin_issue_id = NoticeBulletins.bulletin_id
            JOIN
                Entities as e1
            ON
                e1.id = Notices.eid
            LEFT JOIN
              Entities as e2
            ON
                e2.id = Notices.supplier_eid
            LEFT JOIN
                Entities as e3
            ON
                e3.id = NoticesExtras.best_supplier
            WHERE
                Notices.notice_id=%s;
            """,
            [notice_id]
        )

        # Check that a notice has been found:
        if len(rows) == 0:
            self.abort(404, detail='Notice with provided `id` not found.')
        notice = rows[0]

        candidates = db.query(
            """
            SELECT
                notice_id,
                eid,
                e1.name,
                supplier_eid,
                e2.name as supplier_name,
                title,
                total_final_value_amount
            FROM
                Notices
            JOIN
                Entities as e1
            ON
                e1.id = Notices.eid
            LEFT JOIN
                Entities as e2
            ON
                e2.id = Notices.supplier_eid
            WHERE
                notice_id in (SELECT unnest(candidates) from NoticesExtras WHERE notice_id = %s);
            """,
            [notice_id]
        )
        if len(candidates) > 0:
            # Make sure that notice.candidates and candidates_extra refer to candidates in the same order.
            candidates_extra = []
            for notice_candidate in notice["candidates"]:
                for candidate in candidates:
                    if notice_candidate == candidate["notice_id"]:
                        candidates_extra.append(candidate)
            notice["candidates_extra"] = candidates_extra

        # Return information about the notice as a JSON:
        self.returnJSON(notice)


class ListNotices(MyServer):

    def get(self):
        db = webapp2.get_app().registry['db']
        rows = db.query(
            """
            SELECT
                eid,
                e1.name,
                supplier_eid,
                e2.name as supplier_name,
                Notices.notice_id,
                contract_id,
                title,
                estimated_value_amount,
                estimated_value_currency,
                Notices.bulletin_issue_id,
                year as bulletin_year,
                number as bulletin_number,
                to_char(published_on,'DD.MM.YYYY') as bulletin_published_on,
                source_url as bulletin_source_url,
                notice_type_id,
                total_final_value_amount,
                total_final_value_currency,
                best_supplier,
                e3.name as best_supplier_name,
                best_similarity,
                price_est,
                price_est_low,
                price_est_high
            FROM
                Notices
            JOIN
                NoticesExtras
            ON
                Notices.notice_id = NoticesExtras.notice_id
            JOIN
                NoticeBulletins
            ON
                Notices.bulletin_issue_id = NoticeBulletins.bulletin_id
            JOIN
                Entities as e1
            ON
                e1.id = Notices.eid
            LEFT JOIN
                Entities as e2
            ON
                e2.id = Notices.supplier_eid
            LEFT JOIN
                Entities as e3
            ON
                e3.id = NoticesExtras.best_supplier
            ORDER BY
                bulletin_issue_id DESC
            LIMIT 300;
            """)
        self.returnJSON(rows)


# Setup of the webapp2 WSGI application
app = webapp2.WSGIApplication([
    ('/obstaravanie', ServeObstaravanie),
    ('/notifications', ServeNotifications),
    ('/updateNotifications', UpdateNotifications),
    ('/info_notice', InfoNotice),
    ('/list_notices', ListNotices),
], debug=False)


def initialise_app():
    """Stores values shared across requests in the app registry."""

    # Database connection:
    db = DatabaseConnection()
    schema = db.get_latest_schema('prod_')
    db.execute('SET search_path to ' + schema + ';')
    app.registry['db'] = db


def main():
    # Parse command line arguments into `args` dictionary:
    parser = argparse.ArgumentParser()
    parser.add_argument('--listen',
                        help='host:port to listen on',
                        default='127.0.0.1:8082')
    args = parser.parse_args()

    # Initialise the application:
    initialise_app()

    # Start serving requests:
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
