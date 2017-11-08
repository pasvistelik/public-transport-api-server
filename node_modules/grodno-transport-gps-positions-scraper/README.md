# grodno-transport-gps-positions-scraper
Module for getting (and assotiating with your routes) the gps-positions of public transport in Grodno.

##### Using example:
```javascript
import GrodnoPositionsScraper from 'grodno-transport-gps-positions-scraper';
var provider = new GrodnoPositionsScraper();

let simpleRoutesForTest = [{type: "bus", number: "1"},{type: "bus", number: "2"}];
(async function() {
    await provider.initialize(simpleRoutesForTest, 2000); //routes_for_assotiating, updating_interval
    let vehicles = provider.getVehicles();    
})();
```
##### Result example:
```javascript
[ 
  { 
    route: { type: 'bus', number: '1' }, // Your route object from "simpleRoutesForTest".
    lat: 53.689405,
    lng: 23.856918,
    timestamp: '07.11.2017 15:53:32',
    localId: '61',
    speedInLastMoment: 12,
    way: null,
    trip: null 
  }
]
```
