import psycopg2
import yaml

def db_connect():
    with open("db_config.yaml", "r") as stream:
        config = yaml.load(stream)
        return psycopg2.connect(user=config["user"], dbname=config["db"])
