#!/usr/bin/env bash

# script to regenerate production data from schemas gained from update_weekly.sh

# set bash strict mode - fail immediately if anything fails
set -eu
IFS=$'\n\t'

# Get to the script's directory:
DIR=$(dirname $(readlink -f "$0"))
cd "${DIR}"
cd ..

# create virtual environment (switched off for now - takes too long)
# sh deploy.sh

# activate virtual environment
. venv/bin/activate

# Set up a log file path:
DATE=$(date +%Y_%m_%d_%H_%M_%S)
LOG_PATH="/tmp/regenerate_prod_data_${DATE}.log"
echo "Command to monitor logs:"
echo "tail ${LOG_PATH};"

# Regenerate prod data:
started=$(date)
echo "Generation started: ${started}"
echo "sudo -u datautils python3 generate_prod_data.py --disable_test_mode > ${LOG_PATH} 2>&1;"
sudo -u datautils python3 generate_prod_data.py --disable_test_mode > ${LOG_PATH} 2>&1
finished=$(date)
echo "Generation finished: ${finished}"

# Restart apps:
sudo svc -t /service/verejne_prod
sudo svc -t /service/prepojenia_prod
sudo svc -t /service/obstaravania_prod
sudo svc -t /service/kataster_prod
sudo svc -t /service/data
echo "Issued commands to restart all apps."

# Regenerate public dumps:
echo "python3 generate_public_dumps.py"
cd prod_generation
sudo -u datautils python3 generate_public_dumps.py
