#!/usr/bin/env nix-shell
#!nix-shell -i bash -p curl jq

if [ $# -ne 2 ]; then
    echo "Usage: $0 <year> <sessionize-all-url>" >&2
    echo "Example: $0 2026 https://sessionize.com/api/v2/abc123/view/All" >&2
    exit 1
fi

YEAR=$1
URL=$2

mkdir -p "data/$YEAR"
curl "${URL//All/Speakers}" | jq > "data/$YEAR/speakers-filtered.json"
curl "${URL//All/GridSmart}" | jq > "data/$YEAR/schedule.json"
