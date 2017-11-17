#!/bin/sh
if [ $# -lt 1 ]; then
    echo 'Please provide input directory with json files.'
    exit 1
fi

if [ ! -d $1 ]; then
    echo 'Please provide input directory with json files.'
    exit 1
fi

ls "$1"/*.json | parallel ./makepdf_single.sh
