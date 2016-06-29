#!/bin/bash

# This script processes data from the WDPA. It:
#
# - limits data to SSA
# - only includes 'Designated' areas (leaves out Proposed, etc)
# - filters out Marine Protected Areas
#
# Usage:
#   $ bash process.sh -i [shapefile]

TMP_DIR="tmp"
EXP_DIR="data"
DEST_FILE="data.geojson"

error()
{
  echo >&2 $*
  exit 1
}

usage()
{
  echo Usage : bash $0 -i [wdpa_data.shp]
}

typeset var_input=""

while getopts "i:h" option
do
  case $option in
  i)
    var_input="$OPTARG"
    ;;
  h)
    usage
    exit 0
    ;;
  *)
    usage
    exit 1
    ;;
  esac
done

# check that input is not empty
[[ $var_input != "" ]] || { usage; exit 1;}

# for portability and just in case which is not available
typeset -r cmd_which="/usr/bin/which"
[[ -x $cmd_which ]] || error "$cmd_which command not found"

# check that every command is available and executable
# this is where a $cmd_foo var will be created for each command
# tar would be called with $cmd_tar
for command in ogr2ogr
do
  typeset -r cmd_$command=$($cmd_which $command)
  [[ -x $(eval echo \$cmd_$command) ]] || error "$cmd_$command command not found"
done

# Perform checks on the destination file
[[ ! -f $EXP_DIR/$DEST_FILE ]] || error "You already have a $EXP_DIR/$DEST_FILE file. Remove it and run this script again."
mkdir -p $EXP_DIR

# The folder should not contain the tmp dir
[[ ! -d $TMP_DIR ]] || error "It seems you already have a tmp directory. Remove it and run this script again."
mkdir $TMP_DIR

# Read in the list with ISO3 codes for SSA
read SSA < ../lib/ssa/iso3.txt

# Filter the data to:
# - remove Marine Protected Areas
# - limit countries to SSA
# - include only Designated areas
echo "Filtering data"
$cmd_ogr2ogr \
  -skipfailures \
  -where "MARINE='0' \
  AND ISO3 IN ($SSA) \
  AND STATUS IN ('Designated')" \
  -select "STATUS" \
  "$TMP_DIR/data2.shp" \
  $var_input

# Dissolve all polygons and write to geojson
# ST_buffer is necessary to fix issues with self-intersecting polygons in the
# source data
echo "Dissolving all polygons into one"
$cmd_ogr2ogr \
  -skipfailures \
  -f "GeoJSON" "$EXP_DIR/$DEST_FILE" \
  "$TMP_DIR/data2.shp" \
  -dialect sqlite \
  -sql "SELECT ST_Union(ST_buffer(geometry,0)) FROM data2"

rm -r $TMP_DIR