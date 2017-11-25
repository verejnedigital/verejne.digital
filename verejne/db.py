import psycopg2
import psycopg2.extras

# database used in the module
db = None

def getConfig():
    import yaml
    with open("db_config.yaml", "r") as stream:
        return yaml.load(stream)

def connect(local = True):
  global db
  config = getConfig()
  db = psycopg2.connect(user=config["user"], dbname=config["db"])

def log(s):
    print "LOG: " + s

def execute(cur, sql, params=[]):
    log("SQL: " + sql)
    log("PARAMS: " + str(params))
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
