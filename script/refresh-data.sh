#!/usr/bin/env nix-shell
#!nix-shell -i bash -p curl jq

if [ $# -ne 1 ]; then
    echo "Usage: $0 [sessionize all URL]" >&2
    exit 1
fi

mkdir -p data
curl "${1//All/Speakers}" | jq > data/speakers-filtered.json
curl "${1//All/GridSmart}" | jq > data/schedule.json
