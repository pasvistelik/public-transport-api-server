import express from 'express';
var router = express.Router();

import DataProvider from 'public-transport-server-code/lib/dataProvider';
import AppServer from 'public-transport-server-code';


import test0 from './tmp/test0';
import grodnoRandomPointsCoords from './tmp/grodnoRandomPointsCoords';


router.get('/', async function (req, res, next) {
    try{
        await DataProvider.loadDataAndInitialize();
        
        function strToCoords(str) {
            if (str == undefined || str == null) return undefined;
            var tmp = str.split(',');
            var myLat = parseFloat(tmp[0]);
            var myLng = parseFloat(tmp[1]);
            if (myLat >= -90 && myLat <= 90 && myLng >= -180 && myLng <= 180) return { lat: myLat, lng: myLng };
            else return undefined;
        }
        function strToSeconds(str) {
            if (str == undefined || str == null) return undefined;
            var tmp = str.split(':');
            var hours = parseInt(tmp[0]);
            var minutes = parseInt(tmp[1]);
            if (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) return 3600 * hours + 60 * minutes;
            else return undefined;
        }

        var fromPosition = strToCoords(req.query.from);
        var toPosition = strToCoords(req.query.to);
        var myStartTime = strToSeconds(req.query.startTime);

        if (fromPosition == undefined || toPosition == undefined || myStartTime == undefined) res.json(null);
        else {
            var oneWayOnly = req.query.oneWayOnly == 'true';

            var my_speed = parseFloat(req.query.goingSpeed);
            if (my_speed == undefined || my_speed == null || my_speed <= 1) my_speed = 5;
            var my_dopTimeMinutes = parseFloat(req.query.dopTimeMinutes);
            if (my_dopTimeMinutes == undefined || my_dopTimeMinutes == null || my_dopTimeMinutes < 0) my_dopTimeMinutes = 2;

            var types = null;
            if (req.query.transportTypes != undefined) types = req.query.transportTypes.split(',');
            if (types == undefined || types == null) types = ["bus", "trolleybus"];

            var startInitializingMoment = Date.now();

            //if (global.initialized) {

            var tmpMyDate = new Date();

            var fromPositionStr = fromPosition.lat + "," + fromPosition.lng;
            var toPositionStr = toPosition.lat + "," + toPosition.lng;
            var typesStr = (types == null || types.length == 0) ? null : types[0];
            for (var i = 1, n = types.length; i < n; i++) typesStr += "," + types[i];
            var hour = Math.floor(myStartTime / 3600);
            var minute = Math.floor((myStartTime - 3600 * hour) / 60);
            var myStartTimeStr = hour + ":" + minute;

            //var paramsStr = "from=" + fromPositionStr + "&to=" + toPositionStr + "&startTime=" + myStartTimeStr + "&dopTimeMinutes=" + my_dopTimeMinutes + "&goingSpeed=" + my_speed + "&transportTypes=" + typesStr;


            //console.log("Start finding oprimal routes. Params: " + paramsStr);

            //var result = new OptimalRoutesCollection(fromPosition, toPosition, myStartTime, types, my_speed, my_dopTimeMinutes);
            
            
            var findedOptimalWays = await AppServer.findWays(fromPositionStr, toPositionStr, myStartTimeStr, my_dopTimeMinutes, my_speed, typesStr, oneWayOnly);

            if(findedOptimalWays != null) console.log("Finded " + findedOptimalWays.length + " optimal routes. Time = " + (Date.now() - startInitializingMoment) + " ms.");

            res.json(findedOptimalWays);
            //}
            //else res.json(null);
        }
    }
    catch(e){
        console.log(e);
        res.json(null);
    }
});


router.get('/tmp/:addDays', async function (req, res, next) {
    let data = [], data1 = [];
    let tmp_data = [];

    for(let i = 0, n = test0.length, currentItem = test0[0]; i < n; currentItem = test0[++i]){
        if (tmp_data[currentItem.station_hashcode] == null) tmp_data[currentItem.station_hashcode] = [];
        if (tmp_data[currentItem.station_hashcode][currentItem.route_hashcode] == null) tmp_data[currentItem.station_hashcode][currentItem.route_hashcode] = [];
        tmp_data[currentItem.station_hashcode][currentItem.route_hashcode][currentItem.dispatch_datetime] = currentItem.count;
    }

    //console.log(tmp_data);

    try{
        var addDays = parseInt(req.params.addDays);
        var t0 = Date.now();

        await DataProvider.loadDataAndInitialize();
        var i=0,j=0,k=0,p=0;
        for(; j<5000; i++){
            if(i>1000 && i>j*3) break;

            let pointsLength = grodnoRandomPointsCoords.length;
            let fromCoords = grodnoRandomPointsCoords[~~(Math.random() * (pointsLength - 1))];
            let toCoords = grodnoRandomPointsCoords[~~(Math.random() * (pointsLength - 1))];
            let fromCoordsStr = fromCoords.lat+","+fromCoords.lng;
            let toCoordsStr = toCoords.lat+","+toCoords.lng;
            let randomHour = ~~(Math.random() * 20 + 5); //~~(Math.random() * 23);
            if (randomHour > 23) randomHour -= 24;
            let randomMinute = ~~(Math.random() * 59);
            let timeStr =randomHour+":"+randomMinute;
            
            let randomTripPassangersCount = ~~(Math.random() * 10 + 1);

            try{
                let findedOptimalWays = await AppServer.findWays(fromCoordsStr, toCoordsStr, timeStr, 3, 5, "bus,trolleybus", true);
                
                if(findedOptimalWays != null){
                    let trCount = findedOptimalWays[0].totalTransportChangingCount;
                    if (trCount > 0){

                        p += randomTripPassangersCount;

                        console.log(j+") ["+timeStr+"]: from ("+fromCoordsStr+") to ("+toCoordsStr+"). tr = "+trCount+", len ~= "+findedOptimalWays[0].points.length+", p = "+randomTripPassangersCount);
                        k+=findedOptimalWays[0].points.length;
                        j++;

                        for(let t=2; t<findedOptimalWays[0].points.length; t++){
                            let point = findedOptimalWays[0].points[t];
                            if (point.route != null){
                                let prevPoint = findedOptimalWays[0].points[t-1];

                                let date = new Date();
                                date.setHours(0);
                                date.setMinutes(0);
                                date.setSeconds(0);
                                date.setMilliseconds(0);

                                date.setHours(randomHour);
                                date.setMinutes(randomMinute);
                                date.setSeconds(prevPoint.dispatchTime);

                                date.setDate(date.getDate()+addDays);
                                

                                date = date.toISOString();

                                data.push({
                                    station_hashcode: prevPoint.station.hashcode,
                                    route_hashcode: point.route.hashcode,
                                    dispatch_datetime: date
                                });

                                if(tmp_data[prevPoint.station.hashcode] == null) tmp_data[prevPoint.station.hashcode] = [];
                                if(tmp_data[prevPoint.station.hashcode][point.route.hashcode] == null) tmp_data[prevPoint.station.hashcode][point.route.hashcode] = [];
                                if(tmp_data[prevPoint.station.hashcode][point.route.hashcode][date] == null){
                                    tmp_data[prevPoint.station.hashcode][point.route.hashcode][date] = randomTripPassangersCount;
                                }
                                else{
                                    tmp_data[prevPoint.station.hashcode][point.route.hashcode][date] += randomTripPassangersCount;
                                }
                            }
                        }
                    }
                }
            }
            catch(e){
                //...
                console.log(e);
            }

        }
        
        //console.log(tmp_data);

        for(let station_key in tmp_data){
            for(let route_key in tmp_data[station_key]){
                for(let date_key in tmp_data[station_key][route_key]){
                    data1.push({
                        station_hashcode: station_key,
                        route_hashcode: route_key,
                        dispatch_datetime: date_key,
                        count: tmp_data[station_key][route_key][date_key]
                    });
                }
            }
        }

        console.log("TMP: "+(Date.now()-t0)+" ms, all = "+j+"(from "+i+"), k = "+data1.length+", total passangers = "+p);

        res.json(data1);
    }
    catch(e){
        console.log(e);
        res.json(null);
    }
});


router.get('/tmpsql', async function (req, res, next) {
    let request = "";

    for(let i = 0, n = test0.length, currentItem = test0[0]; i < n; currentItem = test0[++i]){
        request += "INSERT IGNORE INTO `arrives_to_stations`(`passangers_count`, `date_time`, `station_id`, `way_id`) VALUES ("+currentItem.count+",\""+currentItem.dispatch_datetime+"\",(SELECT `station_id` FROM `stations` WHERE `tmp_station_hashcode`=\""+currentItem.station_hashcode+"\" LIMIT 1),(SELECT `way_id` FROM `ways_vs_stations_relations` WHERE `station_id` = (SELECT `station_id` FROM `stations` WHERE `tmp_station_hashcode`=\""+currentItem.station_hashcode+"\" LIMIT 1) AND `way_id` IN (SELECT `way_id` FROM `ways` WHERE `route_id`=(SELECT `route_id` FROM `routes` WHERE `tmp_route_hashcode`=\""+currentItem.route_hashcode+"\" LIMIT 1)) LIMIT 1)); ";
    }
    res.send(request);
});

module.exports = router;

