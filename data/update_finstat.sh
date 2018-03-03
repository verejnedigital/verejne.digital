#!/bin/sh

# Exit whenever a command fails
set -e

# Parameters
URL=$1
TMPDIR=/tmp/update_finstat.$$

# Ensure the temporary directory is deleted whenever the script terminates
trap "rm -rf ${TMPDIR}" EXIT

# Download URL into the temporary directory
mkdir $TMPDIR
curl -sfo ${TMPDIR}/finstat.zip $URL

# Unzip
unzip -o ${TMPDIR}/finstat.zip -d ${TMPDIR}

# The header line of company_stats.csv starts with 4 unneeded characters.
# Also, each subsequent line starts with = and ends with a redundant delimiter.
# Remove these using awk and tail (to handle the header line)
awk '{print substr($0, 2, length($0)-3)}' ${TMPDIR}/company_stats.csv | tail +3c > ${TMPDIR}/company_stats_cleaned.csv

# Move the cleaned CSV into the location expected by the source data updating Python script
mv ${TMPDIR}/company_stats_cleaned.csv /tmp/source_finstat.csv
python source_update.py finstat
