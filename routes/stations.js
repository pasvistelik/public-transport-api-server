var express = require('express');
var router = express.Router();

import DataProvider from 'public-transport-server-code/lib/dataProvider';

/* GET users listing. */
router.get('/', async function(req, res, next) {
    await DataProvider.loadDataAndInitialize();
    res.send(DataProvider.getAllStationsJSON());
});


router.get('/migrate', async function(req, res, next) {
    await DataProvider.loadDataAndInitialize();
    let tmpAllStations = DataProvider.getAllStations();

    let result = [];

    for(let i=0, n=tmpAllStations.length, item=tmpAllStations[0]; i<n; item=tmpAllStations[++i]){
        result.push({
            lat: item.coords.lat,
            lng: item.coords.lng,
            name: item.name,
            tmp_station_hashcode: item.hashcode,
        });
    }

    res.send(JSON.stringify(result));
});

module.exports = router;
