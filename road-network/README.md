# Proximity to road
This folder contains scripts to download and process road network data from OSM. It buffers OSM data by a number of distances and outputs a merged polygon per buffer distance.

Tested to work with Node v4.2.x.

## Usage
The following command will divide Tanzania (`tza`) in a grid of 4 columns and 3 rows:

```
$node road-network.js --iso tza --col 4 --row 3
```

The grid approach is necessary to deal with bounding box limitations of Overpass, but also to speed up merging the buffered roads.

## About the data
Data produced with these scripts is licensed under OpenStreetMap's [Open Database License](http://wiki.openstreetmap.org/wiki/Open_Database_License).