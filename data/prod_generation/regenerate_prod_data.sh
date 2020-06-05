#!/usr/bin/env bash

# set bash strict mode - fail immediately if anything fails
set -eu
IFS=$'\n\t'

# Get the script's directory:
DIR=$(dirname $(readlink -f "$0"))

# Set up log file path:
DATE=$(date +%Y_%m_%d_%H_%M_%S)
LOG_PATH="/tmp/regenerate_prod_data_${DATE}.log"
echo "Command to monitor logs:"
echo "tail ${LOG_PATH};"

# Regenerate prod data:
started=$(date)
echo "Generation started: ${started}"
echo "cd ${DIR}; cd ..; python3 generate_prod_data.py --disable_test_mode; > ${LOG_PATH} 2>&1"
sudo -u datautils "cd ${DIR}; cd ..; python3 generate_prod_data.py --disable_test_mode; > ${LOG_PATH} 2>&1"
finished=$(date)
echo "Generation finished: ${finished}"

# Restart apps:
svc -t /service/verejne_prod
svc -t /service/prepojenia_prod
svc -t /service/obstaravania_prod
svc -t /service/kataster_prod
svc -t /service/data
echo "Issued commands to restart all apps."

# Regenerate public dumps:
echo "cd ${DIR}; python3 generate_public_dumps.py"
sudo -u datautils "cd ${DIR}; python3 generate_public_dumps.py"
