#!/usr/bin/env bash

# set bash strict mode - fail immediately if anything fails
set -eu
IFS=$'\n\t'

# Define working directory:
dir="/tmp/"

# Download and save raw JSON file:
echo "Downloading KamIduEurofondy..."
today=$(date '+%Y-%m-%d_%H-%M-%S')
path_raw="${dir}kamidueurofondy_${today}.json"
url="${1}?format=json&offset=0&limit=123456"
echo "$url -o $path_raw"
curl "$url" -o "$path_raw"

# Flatten downloaded JSON file:
echo "Flattening KamIduEurofondy..."
path_flattened="${dir}kamidueurofondy_${today}_flattened.json"
eval python kamidueurofondy.py "$path_raw" "$path_flattened"

# Stage flattened JSON for source update:
cp "$path_flattened" "/tmp/source_KamIduEurofondy.json"

# Update the KamIduEurofondy source:
shift
echo "python source_update.py KamIduEurofondy" "$@"
eval python source_update.py KamIduEurofondy "$@"
