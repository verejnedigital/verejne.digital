#!/usr/bin/env bash

# set bash strict mode - fail immediately if anything fails
set -eu
IFS=$'\n\t'

echo "Removing old environment..."
rm -rf ./venv

echo "Creating new environment..."
python -m venv venv
echo "Activating new environment..."
. venv/bin/activate
echo "Installing requirements..."
pip install --upgrade pip
pip install wheel
pip install Cython
pip install -r requirements.txt
