#!/usr/bin/env python
# -*- coding: utf-8 -*-
import argparse
import logging
from sqlalchemy.sql import func

from data_model import Candidate, MakeSession, Notification, NotificationStatus, Session, Obstaravanie, LastNotificationUpdate
import db
import utils

logging.basicConfig(format='%(asctime)s : %(levelname)s : %(message)s', level=logging.INFO)

parser = argparse.ArgumentParser()
parser.add_argument("--generate_notifications", action="store_true")
parser.add_argument("--test_report", action="store_true")
options = parser.parse_args()

db.connect(False)

max_won = 5
min_similarity = 0.6
max_price_ratio = 10.0
max_good_candidates_per_obst = 5

ico_lat_lng = {}


# Computes distance in points between to lat long points. Thank you StackOverflow
def DistancePoints(lon1, lat1, lon2, lat2):
    from math import radians, cos, sin, asin, sqrt
    # convert decimal degrees to radians 
    lon1, lat1, lon2, lat2 = list(map(radians, [lon1, lat1, lon2, lat2]))
    # haversine formula
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
    c = 2 * asin(sqrt(a))
    km = 6367 * c
    return km


def IsGoodCandidate(obst, candidate):
    if candidate.score < min_similarity:
        return False
    if (obst.draft_price > 0) and (candidate.reason.final_price > 0):
        ratio = obst.draft_price / float(candidate.reason.final_price)
        if (ratio < 1.0 / max_price_ratio) or (ratio > max_price_ratio):
            return False
    if obst.draft_price > 0:
        lat_lng1 = ico_lat_lng.get(utils.NormalizeIco(obst.customer.ico), None)
        lat_lng2 = ico_lat_lng.get(utils.NormalizeIco(candidate.company.ico), None)
        lat_lng3 = ico_lat_lng.get(utils.NormalizeIco(candidate.reason.customer.ico), None)
        if lat_lng2 is None: lat_lng2 = lat_lng3
        if (lat_lng1 is not None) and (lat_lng2 is not None):
            dst = DistancePoints(lat_lng1[1], lat_lng1[0], lat_lng2[1], lat_lng2[0])
            if 1000 * dst > obst.draft_price:
                return False
    return True


# generates notifications
def GenerateNotifications():
    global ico_lat_lng
    ico_lat_lng = utils.IcoToLatLngMap()

    with Session() as session:

        # Get the highest id that has been already processed
        last_update = session.query(LastNotificationUpdate).first()
        min_id = last_update.last_id if last_update is not None else 0
        print("Last processed id", min_id)

        # compute id's of companies with <= max_won already won
        cnts = session.query(func.count(Obstaravanie.winner_id), Obstaravanie.winner_id).group_by(Obstaravanie.winner_id)
        eligible_companies = set()
        for cnt, company_id in cnts:
            if cnt <= max_won:
                eligible_companies.add(company_id)

        # keep track of already generated candidates, so that a notification is not
        # generated twice
        generated_notifications = set(e[0] for e in session.query(Notification.candidate_id).all())

        gens = 0
        max_id = None
        for obst in session.query(Obstaravanie). \
                filter(Obstaravanie.id >= min_id). \
                order_by(-Obstaravanie.id).limit(1000):
            if max_id is None:
                max_id = obst.id
            if (obst.winner_id is not None) or obst.finished:
                continue
            good_candidates = 0
            for candidate in obst.candidates:
                if IsGoodCandidate(obst, candidate):
                    good_candidates += 1
                    if good_candidates > max_good_candidates_per_obst:
                        break
                    # Process only candidates, for which we know the address
                    if utils.getAddressForIco(candidate.company.ico) == "":
                        continue
                    if ((candidate.company_id in eligible_companies) and
                            not (candidate.id in generated_notifications) and
                            (candidate.reason.customer.ico != obst.customer.ico)):
                        notification = Notification(
                            candidate_id=candidate.id,
                            status=NotificationStatus.GENERATED,
                            date_generated=func.now(),
                            date_modified=func.now())
                        gens += 1
                        session.add(notification)
        print("Generated #notifications:", gens)

        # Update the highest synced obstaravanie.id
        session.query(LastNotificationUpdate).delete(synchronize_session=False)
        last_update = LastNotificationUpdate(last_id=max_id)
        session.add(last_update)

        session.commit()
        session.close()


def TestReport():
    with Session() as session:
        for_report = session.query(Notification).order_by(Notification.id)[:2]
        for f in for_report:
            print(f.candidate.company_id)
        utils.generateReport(for_report)


if options.test_report:
    TestReport()
if options.generate_notifications:
    GenerateNotifications()
