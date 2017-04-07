import MySQLdb
import argparse

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
  if local:
    db = MySQLdb.connect(
            host = "localhost", user = "webserver", passwd = "", db = "afp", charset="utf8")
  else:
    config = getConfig()
    db = MySQLdb.connect(
            host = config["host"], user = config["user"],
            passwd = config["passwd"], db = config["db"], charset="utf8")

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
    if not db.open: connect(False)
    return db.cursor(MySQLdb.cursors.DictCursor)

def insertDictionary(table, values, returnId=True):
    columns = ', '.join(values.keys())
    placeholders = ', '.join(["%s"] * len(values))
    sql = 'INSERT INTO ' + table + ' ({}) VALUES ({})'.format(columns, placeholders)
    #print "insertDictionary", sql
    cursor = getCursor()
    execute(cursor, sql,
            [value.encode("utf-8") if isinstance(value, basestring) else value
            for value in values.values()])
    last = None
    if returnId: last = cursor.lastrowid
    cursor.close()
    return last

def checkTableExists(dbcon, tablename):
    dbcur = getCursor()
    execute(dbcur,
            "SELECT COUNT(*) as cnt FROM information_schema.tables WHERE table_name =%s",
            [tablename])
    if dbcur.fetchone()['cnt'] == 1:
        dbcur.close()
        return True
    dbcur.close()
    return False

def getColumnType(table, column):
    try:
      cur = getCursor()
      query = "SHOW COLUMNS FROM " + table + " WHERE Field='" + column + "'"
      execute(cur, query)
      orig_type = cur.fetchone()["Type"]
      return orig_type 
    except:
      return None

