#!/bin/sh
# Script to download the latest contracts, update the model, compute predictions and estimates and
# create the static files and to precompute notifications

JSON_DIR=/tmp/ 
STATIC_DIR=/tmp/
OUTPUT_DIR=../../generated/obstaravania/

. venv/bin/activate

export LD_PRELOAD=/usr/local/lib/gcc5/libgcc_s.so.1

python main.py \
	--update_platforma --update_platforma_all \
	--compute_predictions \
        --compute_estimates \
	--generate_companies --companies_json_name="${JSON_DIR}/prod_companies.json" \
	--generate_json --json_name="${JSON_DIR}/prod.json" \
	--generate_table --table_name="${STATIC_DIR}/obstaravania.html" \
	--companies_table_name="${STATIC_DIR}/obstaravania-firmy.html"

cp ${STATIC_DIR}/obstaravania.html $OUTPUT_DIR
cp ${STATIC_DIR}/obstaravania-firmy.html $OUTPUT_DIR

# Compute notifications
python notification.py --generate_notifications
