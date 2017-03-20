#!/bin/sh
# Script to generate the static files from data and templates.

JSON_DIR=/tmp/ 
STATIC_DIR=/tmp/

. venv/bin/activate

python main.py \
	--companies_json_name="${JSON_DIR}/prod_companies.json" \
        --json_name="${JSON_DIR}/prod.json" \
	--generate_table --table_name="${STATIC_DIR}/obstaravania.html" \
	--companies_table_name="${STATIC_DIR}/obstaravania-firmy.html"
