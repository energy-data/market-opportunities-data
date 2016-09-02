#!/bin/bash

# This script processes Solar Potential data (GHI) for Nigeria, Tanzania and
# Zambia.
#
# Requires the $SRC_FILE to be present in the /source folder

TMP_DIR="tmp"
EXP_DIR="data"
SRC_FILE=(NigeriaGHI TanzaniaGHI ZambiaGHI)

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
for command in ogr2ogr ogrinfo
do
  typeset -r cmd_$command=$($cmd_which $command)
  [[ -x $(eval echo \$cmd_$command) ]] || error "$cmd_$command command not found"
done

# # The folder should not contain the tmp dir
[[ ! -d $TMP_DIR ]] || error "It seems you already have a tmp directory. Remove it and run this script again."
mkdir $TMP_DIR

[[ ! -f $EXP_DIR/$DEST_FILE ]] || error "You already have a $EXP_DIR/$DEST_FILE file. Remove it and run this script again."
mkdir -p $EXP_DIR

# Initialize an empty shapefile
$cmd_ogr2ogr ./$TMP_DIR/merged.shp -a_srs EPSG:4326

for file in ${SRC_FILE[@]}
do
  # Slightly reduce precision of the irradiance by dividing by 10. gdal_polygonize 
  # will convert to int
  gdal_calc.py -A ./source/$file.tif --outfile=./$TMP_DIR/$file.tif --calc="A/10"
  
  # Create a vector from the TIF
  gdal_polygonize.py ./$TMP_DIR/$file.tif -f "ESRI Shapefile" ./$TMP_DIR/$file.shp fieldname "ghi_kwh_m2"

  # Multiply field by 10 to get Kwh/m2 again
  $cmd_ogrinfo ./$TMP_DIR/$file.shp -dialect SQLite -sql "UPDATE "$file" SET ghi_kwh_m2 = ghi_kwh_m2*10"

  # Merge all shapefiles into one
  $cmd_ogr2ogr -update -append ./$TMP_DIR/merged.shp ./$TMP_DIR/$file.shp -nln merged
done

# Generate a geojson and ensure that the correct projection is set
$cmd_ogr2ogr -f "GeoJSON" ./$TMP_DIR/data.geojson ./$TMP_DIR/merged.shp -t_srs EPSG:4326

node ../tools/add-iso.js ./$TMP_DIR/data.geojson

mv ./export.json ./$EXP_DIR/data.geojson

rm -r $TMP_DIR