## Protected Areas
This script processes WDPA data on protected areas in Sub-Saharan Africa.

The processing script:

- filters out the marine protected areas;
- includes only 'Designated' areas;
- simplifies the properties; and
- limits the data [to Sub-Saharan Africa](../lib/ssa/iso3.txt).

### Usage

1. Download the [WDPA dataset](http://www.protectedplanet.net/) in shapefile format
2. Extract the zip file
3. Run `$ bash process.sh [shapefile]` to generate a geojson.

### About the data
**Source:** World Database on Protected Areas  
**Description:** The World Database on Protected Areas (WDPA), a join project of IUCN and UNEP, and the most comprehensive global database on terrestrial and marine protected areas.
**URL:** http://www.protectedplanet.net/

### Methodology

#### Marine Protected Areas
The dataset is filtered to areas that are fully terrestrial.

From WDPA Manual v1.0:

> The ‘Marine’ field specifies whether the protected area has a marine component recorded as either ‘0’ (no marine component) ‘1’ (site has marine and terrestrial portions),’2’ site is entirely located in the marine environment. [...]

#### Designation
The script only takes 'Designated' areas into account.

From WDPA Manual v1.0:

> Recommendations: Users might want to decide to include designated protected areas only in their analyses. In that case all sites where STATUS = ‘Proposed’, ‘Established’, and ‘Not Reported’ should be removed. It is important to note that the removal of proposed sites may be excluding an important number of protected areas that might be delivering some conservation on the ground. [...]