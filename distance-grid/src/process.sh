#!/bin/bash

# This script downloads a zipped shapefile and converts it to
# geojson

TMP_DIR="tmp"
SRC_URL="http://www.infrastructureafrica.org/system/files/library/2012/03/AICD_ALL%20Countries%20Electricity%20Transmission%20Network.zip"
DL_FILE="download.zip"
SRC_FILE="AICD_ALL Countries Electricity Transmission Network.shp"


error()
{
  echo >&2 $*
  exit 1
}

# for portability and just in case which is not available
typeset -r cmd_which="/usr/bin/which"
[[ -x $cmd_which ]] || error "$cmd_which command not found"

# check that every command is available and executable
# this is where a $cmd_foo var will be created for each command
# tar would be called with $cmd_tar
for command in unzip ogr2ogr wget
do
  typeset -r cmd_$command=$($cmd_which $command)
  [[ -x $(eval echo \$cmd_$command) ]] || error "$cmd_$command command not found"
done


# The folder should not contain the tmp dir
[[ ! -d $TMP_DIR ]] || error "It seems you already have a tmp directory. Remove it and run this script again."
mkdir $TMP_DIR

[[ ! -f data.geojson ]] || error "You already have a data.geojson file. Remove it and run this script again."

# Download file and write to tmp directory
echo "Downloading the file..."
$cmd_wget -q $SRC_URL -O $TMP_DIR/$DL_FILE

# Unzip, files will be overwritten without prompt
$cmd_unzip -q -o $TMP_DIR/$DL_FILE -d $TMP_DIR

# Convert to geojson. If the geojson already exists, it will NOT be overwritten
echo "Convert Shapefile to GeoJSON"
$cmd_ogr2ogr -where "'STATUS' = 'Existing'" -f "GeoJSON" aicd-grid-network.geojson "$TMP_DIR/$SRC_FILE"

rm -r $TMP_DIR
