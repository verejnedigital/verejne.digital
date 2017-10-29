#!/bin/sh

. venv/bin/activate

exec python ./server.py $@
