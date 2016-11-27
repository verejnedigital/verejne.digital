import argparse
import psycopg2
import psycopg2.extras

# database used in the module
db = None

# define some flags modifying how we access the database
parser = argparse.ArgumentParser()
parser.add_argument("--dryrun", help="do not modify database", action="store_true")
parser.add_argument("--sql_silent", help="do print sql commands", action="store_true")
args = None

def getConfig():
    import yaml
    with open("db_config.yaml", "r") as stream:
        return yaml.load(stream)

def connect(local = True):
  global db, args
  args = parser.parse_args()
  config = getConfig()
  db = psycopg2.connect(user=config["user"], dbname=config["db"])

def log(s):
    print "LOG: " + s

def execute(cur, sql, params=[]):
    global args
    if not (args.sql_silent):
        log("SQL: " + sql)
        log("PARAMS: " + str(params))
    if args.dryrun:
        if not (("select" in sql.lower()) or ("show columns" in sql.lower())):
            print "Not executing, dryrun"
            return
    try:
    	  cur.execute(sql, params)
    except Exception as ex:
        print "Exception in SQL execution, retrying command once"
        print ex
        connect(False)
        cur = getCursor()
        cur.execute(sql, params)
    return cur

def getCursor():
    if db.closed: connect(False)
    cur = db.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("SET search_path = 'mysql'")
    return cur
