#!/bin/sh

rm -rf ./venv

virtualenv ./venv \
&& . venv/bin/activate \
&& pip install -r requirements.txt
