#!/bin/bash

# This bash script generates grid network data for a list of countries

isoCodes="`cat ../lib/ssa/ssa-iso3.txt`"
mkdir ./data
for iso in $isoCodes
do
  node ./index.js --iso "${iso,,}"
done