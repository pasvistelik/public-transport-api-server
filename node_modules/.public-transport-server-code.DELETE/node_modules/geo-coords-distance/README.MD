Module for counting distances on the Earth between two points.

Install:
```
npm install geo-coords-distance
```

Exsample:
```javascript
import distance from 'geo-coords-distance';

var firstPoint = {lat: 53.6847, lng: 23.8402}, secondPoint = {lat: 53.9271, lng: 27.5252};

var result = distance(firstPoint, secondPoint);
```
