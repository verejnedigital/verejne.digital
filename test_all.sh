#!/usr/bin/env bash

# set bash strict mode - fail immediately if anything fails
set -eu
IFS=$'\n\t'

# Get the script's directory:
DIR=$(dirname "$(readlink -f "$0")")

# test verejne
echo "Testing verejne"
cd "${DIR}"/verejne
sh deploy.sh
. venv/bin/activate
sudo -u verejne python test.py
echo "Testing verejne completed!"

# test prepojenia
echo "Testing prepojenia"
cd "${DIR}"/prepojenia
sh deploy.sh
. venv/bin/activate
sudo -u prepojenia python test.py
echo "Testing prepojenia completed!"

# test obstaravania
echo "Testing obstaravania"
cd "${DIR}"/obstaravania
sh deploy.sh
. venv/bin/activate
sudo -u obstaravania python test.py
echo "Testing obstaravania completed!"

# test kataster
echo "Testing kataster"
cd "${DIR}"/kataster
sh deploy.sh
. venv/bin/activate
sudo -u kataster python test.py
echo "Testing kataster completed!"

# test data
echo "Testing data"
cd "${DIR}"/data
sh deploy.sh
. venv/bin/activate
sudo -u data python test.py
echo "Testing data completed!"

echo "All tests completed"