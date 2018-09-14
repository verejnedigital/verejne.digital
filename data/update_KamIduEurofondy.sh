#!/bin/sh

# Exit whenever a command fails:
set -e;

# Define working directory:
dir="/tmp/";

# Download and save raw JSON file:
today=`date '+%Y-%m-%d_%H-%M-%S'`;
path_raw="${dir}kamidueurofondy_${today}.json";
url="${1}?format=json&offset=0&limit=123456";
curl "$url" -o "$path_raw";

# Flatten downloaded JSON file:
path_flattened="${dir}kamidueurofondy_${today}_flattened.json";
python kamidueurofondy.py "$path_raw" "$path_flattened";

# Stage flattened JSON for source update:
cp "$path_flattened" "/tmp/source_KamIduEurofondy.json";

# Update the KamIduEurofondy source:
python source_update.py KamIduEurofondy;
