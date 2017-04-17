#!/bin/sh

. venv/bin/activate

export LD_PRELOAD=/usr/local/lib/gcc5/libgcc_s.so.1
exec ./serving.py
