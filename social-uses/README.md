## Social uses
This folder contains scripts to download and process data on social uses in Sub-Saharan Africa from OSM. 

### Health
```
$ node healthcare.js
```

Downloads and processes every node and way with the following tags from OSM:

- [amenity=doctors](http://wiki.openstreetmap.org/wiki/Tag:amenity%3Ddoctors)
- [amenity=hospital](http://wiki.openstreetmap.org/wiki/Tag:amenity%3Dhospital)
- [amenity=clinic](http://wiki.openstreetmap.org/wiki/Tag:amenity%clinic)

### Education
```
$ node education.js
```

Downloads and processes every node and way with the following tags from OSM:

- [amenity=college](http://wiki.openstreetmap.org/wiki/Tag:amenity%3Dcollege);
- [amenity=kindergarten](http://wiki.openstreetmap.org/wiki/Tag:amenity%3Dkindergarten);
- [amenity=school](http://wiki.openstreetmap.org/wiki/Tag:amenity%3Dschool);
- [amenity=university](http://wiki.openstreetmap.org/wiki/Tag:amenity%3Duniversity);

## About the data
Data produced with these scripts is licensed under OpenStreetMap's [Open Database License](http://wiki.openstreetmap.org/wiki/Open_Database_License).