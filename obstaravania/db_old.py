# TODO: this is copied all over the place
# Do proper packaging / deployment
import psycopg2
import psycopg2.extras

# database used in the module
db = None

def getConfig():
    import yaml
    with open("db_config_old.yaml", "r") as stream:
        return yaml.load(stream)

def connect(local = True):
  global db, args
  config = getConfig()
  db = psycopg2.connect(user=config["user"], dbname=config["db"])
  db.autocommit = True

def log(s):
    print "LOG: " + s

def execute(cur, sql, params=[]):
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
