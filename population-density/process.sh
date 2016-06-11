#!/bin/bash

# This script processes Worldpop data for Africa. It down-samples it
# to a 100km2 grid and averages the population estimate (pop per 100km2)
# It then vectorizes the data and generates a geojson.
#
# Requires the $SRC_FILE to be present in the root

TMP_DIR="tmp"
EXP_DIR="data"
SRC_FILE="africa2010ppp.tif"
DEST_FILE="data.mbtiles"


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
for command in ogr2ogr tippecanoe gdalwarp
do
  typeset -r cmd_$command=$($cmd_which $command)
  [[ -x $(eval echo \$cmd_$command) ]] || error "$cmd_$command command not found"
done


# Check if there is a file with Worldpop data
[[ -f $SRC_FILE ]] || error "You don't have the $SRC_FILE file with Worldpop data. Download it and place it in the root of this project."

# The folder should not contain the tmp dir
[[ ! -d $TMP_DIR ]] || error "It seems you already have a tmp directory. Remove it and run this script again."
mkdir $TMP_DIR

[[ ! -f $EXP_DIR/$DEST_FILE ]] || error "You already have a $EXP_DIR/$DEST_FILE file. Remove it and run this script again."
mkdir -p $EXP_DIR


# Re-sample the TIF to a 100km2 grid.
# Original TIF in WGS 84, re-projection is necessary to make it equidistant (courtesy Matt Hanson)
$cmd_gdalwarp africa2010ppp.tif $TMP_DIR/resampled-avg.tif -r average -t_srs "+proj=aea +lat_1=20 +lat_2=-23 +lat_0=0 +lon_0=25 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs" -tr 10000 10000 

# Polygonizing will turn floating point to an integer
# Multiply by 100 to retain some precision
gdal_calc.py -A $TMP_DIR/resampled-avg.tif --outfile=$TMP_DIR/resampled-total.tif --calc="A*100" --NoDataValue=0

# Create a vector from the TIF with total population per 100km2
gdal_polygonize.py $TMP_DIR/resampled-total.tif -f "GeoJSON" $TMP_DIR/resampled.geojson fieldname "pop100km2"

# Ensure that the correct projection is set
$cmd_ogr2ogr -f "GeoJSON" $EXP_DIR/data.geojson $TMP_DIR/resampled.geojson -s_srs "+proj=aea +lat_1=20 +lat_2=-23 +lat_0=0 +lon_0=25 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs" -t_srs EPSG:4326

rm -r $TMP_DIR