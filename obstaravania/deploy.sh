#!/bin/sh

rm -rf ./venv

virtualenv-2.7 --system-site-packages ./venv \
&& . venv/bin/activate \
&& pip install -r requirements.txt
