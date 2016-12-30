#!/bin/sh
# Script to download the latest contracts, update the model, compute predictions and estimates and
# create the static files.

JSON_DIR=/tmp/ 
STATIC_DIR=/tmp/
OUTPUT_DIR=static/

. venv/bin/activate

python main.py \
	--update_platforma --update_platforma_all \
	--create_model \
	--compute_predictions \
        --compute_estimates \
	--generate_companies --companies_json_name="${JSON_DIR}/prod_companies.json" \
	--generate_json --json_name="${JSON_DIR}/prod.json" \
	--generate_table --table_name="${STATIC_DIR}/obstaravania.html" \
	--companies_table_name="${STATIC_DIR}/obstaravania-firmy.html"

cp ${STATIC_DIR}/obstaravania.html $OUTPUT_DIR
cp ${STATIC_DIR}/obstaravania-firmy.html $OUTPUT_DIR
