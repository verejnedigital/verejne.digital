import argparse
from optparse import OptionParser
from jinja2 import Template
import json

parser = argparse.ArgumentParser()
parser.add_argument("--table_name", default="table.html")
parser.add_argument("--json_name", default="table.json")
parser.add_argument("--template_name", default="obstaravania.tmpl")
options = parser.parse_args()

f = open(options.table_name, "w")
template = Template(open(options.template_name).read().decode("utf8"), trim_blocks=True, lstrip_blocks=True)
results = json.loads(open(options.json_name).read())
s = template.render(obstaravania=results)
print >>f, s.encode("utf8")
