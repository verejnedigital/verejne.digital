#!/usr/bin/env bash

# set bash strict mode - fail immediately if anything fails
set -eu
IFS=$'\n\t'

# Extract command line parameter.
URL=$1

# Create a temporary directory (deleted when the script terminates).
TMPDIR=/tmp/update_rpvs.$$
mkdir $TMPDIR
trap 'rm -rf ${TMPDIR}' EXIT

# Download ZIP file from the provided URL.
curl -sfo ${TMPDIR}/source_rpvs.zip "$URL"

# Unzip into the temporary directory.
unzip -o ${TMPDIR}/source_rpvs.zip -d ${TMPDIR}

# Stage the CSV file for the source update.
mv ${TMPDIR}/rpvs_dump_all.csv /tmp/source_rpvs.csv

# Update source "rpvs".
shift
echo "python source_update.py rpvs" "$@"
eval python source_update.py rpvs "$@"

# Delete the source file.
rm /tmp/source_rpvs.csv
