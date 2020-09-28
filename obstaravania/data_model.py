# -*- coding: utf-8 -*-
import psycopg2
import sqlalchemy
from sqlalchemy import Column, Float, Integer, String, Boolean, DateTime, and_
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.orm import sessionmaker
from sqlalchemy.types import Enum

import contextlib
import enum
import os
import yaml

import db_old

db_old.connect(False)

# Defining database scheme here
with open("db_config_old.yaml", "r", encoding='utf-8') as stream:
    config = yaml.load(stream, Loader=yaml.FullLoader)
engine = sqlalchemy.create_engine('postgresql+psycopg2://' + config["user"] + "@/" + config["db"], client_encoding='utf8')
with engine.connect() as conn:
    conn.execute("SET search_path TO obstaravania")

Base = declarative_base()


class Firma(Base):
    __tablename__ = 'firma'
    id = Column(Integer, primary_key=True)
    ico = Column(String, index=True)
    name = Column(String)
    address = Column(String)
    email = Column(String)


class Candidate(Base):
    __tablename__ = 'candidate'
    id = Column(Integer, primary_key=True)
    score = Column(Float)
    company_id = Column(Integer, ForeignKey("firma.id"))
    company = relationship("Firma")
    obstaravanie_id = Column(Integer, ForeignKey("obstaravanie.id"))
    obstaravanie = relationship("Obstaravanie", back_populates="candidates", foreign_keys=[obstaravanie_id])
    reason_id = Column(Integer, ForeignKey("obstaravanie.id"))
    reason = relationship("Obstaravanie", foreign_keys=[reason_id])


# Prediction for average price and stddev.
class Prediction(Base):
    __tablename__ = 'prediction'
    id = Column(Integer, primary_key=True)
    obstaravanie_id = Column(Integer, ForeignKey("obstaravanie.id"))
    obstaravanie = relationship("Obstaravanie", back_populates="predictions", foreign_keys=[obstaravanie_id])
    mean = Column(Float)
    stdev = Column(Float)
    num = Column(Integer)  # Sample size from which the estimates were generated


class Obstaravanie(Base):
    __tablename__ = 'obstaravanie'
    id = Column(Integer, primary_key=True)
    official_id = Column(String, index=True)
    description = Column(String)
    title = Column(String)
    json = Column(String)
    bulletin_year = Column(Integer)
    bulleting_number = Column(Integer)
    bulletin_id = Column(Integer)
    ekosystem_id = Column(Integer)
    contract_id = Column(Integer, index=True)
    finished = Column(Boolean)
    draft_price = Column(Float)
    final_price = Column(Float)
    winner_id = Column(Integer, ForeignKey("firma.id"))
    winner = relationship("Firma", back_populates="obstaravania", foreign_keys=[winner_id])
    customer_id = Column(Integer, ForeignKey("firma.id"))
    customer = relationship("Firma", back_populates="obstaraval", foreign_keys=[customer_id])
    candidates = relationship("Candidate", back_populates="obstaravanie", foreign_keys=[Candidate.obstaravanie_id])
    predictions = relationship("Prediction", back_populates="obstaravanie", foreign_keys=[Prediction.obstaravanie_id])


Firma.obstaravania = relationship("Obstaravanie", order_by=Obstaravanie.id, back_populates="winner", foreign_keys=[Obstaravanie.winner_id])
Firma.obstaraval = relationship("Obstaravanie", order_by=Obstaravanie.id, back_populates="customer", foreign_keys=[Obstaravanie.customer_id])


class RawNotice(Base):
    __tablename__ = 'raw_notice'
    id = Column(Integer, primary_key=True)
    notice = Column(String)


# This table should always have only one row: the time of the last sync
# of slovensko.digital data
class LastSync(Base):
    __tablename__ = 'last_sync'
    last_sync = Column(String, primary_key=True)


# This table should always have only one row: the last id used for generating
# notifications
class LastNotificationUpdate(Base):
    __tablename__ = 'last_notification_update'
    last_id = Column(Integer, primary_key=True)


class NotificationStatus(enum.Enum):
    GENERATED = 1
    APPROVED = 2
    DECLINED = 3


class Notification(Base):
    __tablename__ = 'notification'
    id = Column(Integer, primary_key=True)
    candidate_id = Column(Integer, ForeignKey("candidate.id"))
    candidate = relationship("Candidate", foreign_keys=[candidate_id])
    status = Column(Enum(NotificationStatus))
    date_generated = Column(DateTime)
    date_modified = Column(DateTime)


Base.metadata.create_all(engine)

MakeSession = sessionmaker(bind=engine)


@contextlib.contextmanager
def Session():
    sess = MakeSession()
    try:
        yield sess
    except:
        sess.rollback()
        raise
    finally:
        sess.close()
