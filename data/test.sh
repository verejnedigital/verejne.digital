#!/bin/sh

# Execute `deploy.sh` first to install virtual environment in ./venv:
# virtualenv-2.7 ./venv \
# && . venv/bin/activate \
# && pip install -r requirements.txt;

. venv/bin/activate
sudo -u data python test.py;
deactivate;
