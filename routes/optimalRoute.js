var express = require('express');
var router = express.Router();

var Points = require('../modules/points');
var distance = require('../modules/geoCoords').distance;






///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Algorithm.
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////




class IgnoringFragments extends Array {
    constructor() {
        super();
        if (arguments[0] != undefined && arguments[0] != null && arguments[0].length != 0) {
            try {
                for (var i = 0, n = arguments[0].length, item = arguments[0][0]; i < n; item = arguments[0][++i])
                this.push(item);
            }
            catch (ex) {
                console.log(ex.message);
            }
        }
    }
    contains(stationCode, routeCode, fromStationCode) {
        for (var i = 0, n = this.length, r = this[0]; i < n; r = this[++i]) {
            if (r.routeCode == routeCode && r.stationCode == stationCode && r.fromStationCode == fromStationCode) return true;
        }
        return false;
    }
}

class OptimalRoutesCollection extends Array {
    constructor(nowPos, needPos, time, types, speed, dopTimeMinutes) {
        super();

        this.push(new OptimalRoute(nowPos, needPos, time, types, speed, dopTimeMinutes));

        var ignoringRoutes = new Array();

        var ignoringFragments = new IgnoringFragments();

        for (var selectedOptimalRoute = this[0]; selectedOptimalRoute != null; selectedOptimalRoute.setVisited(), selectedOptimalRoute = this.selectOptimalRouteWithMinimalMark()) {
            var ddd = 0.25;

            ignoringRoutes = new Array();
            // Проходим по всем ребрам выбранного пути и строим новые маршруты при удалении ребер:
            for (var tmpP = selectedOptimalRoute.myPoints.finalPoint; tmpP.previousPoint != null; tmpP = tmpP.previousPoint) {
                if (tmpP.fromWhichRoute != null && !ignoringRoutes.includes(tmpP.fromWhichRoute)) ignoringRoutes.push(tmpP.fromWhichRoute);
            }
            for (var i = 0, n = ignoringRoutes.length, r = ignoringRoutes[0]; i < n; r = ignoringRoutes[++i]) {
                if (selectedOptimalRoute.ignoringRoutes.includes(r)) continue;
                var ignoringRoutesAdd = new Array();
                ignoringRoutesAdd = ignoringRoutesAdd.concat(selectedOptimalRoute.ignoringRoutes);
                ignoringRoutesAdd.push(r);
                var tmpOptimalRoute = new OptimalRoute(nowPos, needPos, time, types, speed, dopTimeMinutes, ignoringRoutesAdd);

                if (tmpOptimalRoute.totalTimeSeconds <= this[0].totalTimeSeconds / ddd) {
                    var tmpJSON = JSON.stringify(tmpOptimalRoute.points);
                    var ok = false;
                    for (var j = 0, m = this.length, opt = this[0]; j < m; opt = this[++j]) {
                        if (JSON.stringify(opt.points) == tmpJSON) {
                            ok = true;
                            break;
                        }
                    }
                    if (ok) continue;
                    this.push(tmpOptimalRoute);
                }
            }
        }
    }
    getOptimalWays() {
        var result = new Array();
        for (var i = 0, n = this.length, r = this[0]; i < n; r = this[++i]) {
            result.push(new OptimalWay(r));
        }
        return result;
    }
    selectOptimalRouteWithMinimalMark() {
        var p = null;
        for (var i = 0, n = this.length, t = this[0]; i < n; t = this[++i]) {
            if (!(t.isVisited)) {
                p = t;
                for (t = this[++i]; i < n; t = this[++i]) {
                    if (!(t.isVisited) && t.totalTimeSeconds < p.totalTimeSeconds) {
                        p = t;
                    }
                }
                return p;
            }
        }
        return null;
    }
}



function getStationsAround(coords, radius) {
    var result = new Array();
    for (var i = 0, n = global.allStations.length, s = global.allStations[0]; i < n; s = global.allStations[++i]) {
        if (s != null && distance(s.coords, coords) < radius) result.push(s);
    }
    return result;
}

class OptimalRoute {
    constructor(nowPos, needPos, time, types, goingSpeed, dopTimeMinutes, ignoringRoutesAdd, ignoringList) {
        if (ignoringRoutesAdd != undefined && ignoringRoutesAdd != null) this.ignoringRoutes = ignoringRoutesAdd;
        else this.ignoringRoutes = new Array();

        this.points = new Array();

        this.needPos = needPos;
        this.nowPos = nowPos;
        this.goingSpeed = goingSpeed;
        this.time = time;
        var reservedTimeSeconds = 60 * dopTimeMinutes;

        this.types = types;

        var myIgnoringFragments = null;
        if (ignoringList != null) myIgnoringFragments = new IgnoringFragments(ignoringList);
        else myIgnoringFragments = new IgnoringFragments();

        var myPoints = new Points(nowPos, needPos);
        // Получим "начальный" список станций:
        var stationsList = getStationsAround(myPoints.startPoint.coords, distance(myPoints.startPoint.coords, myPoints.finalPoint.coords));
        myPoints.fillStartData(stationsList, goingSpeed, reservedTimeSeconds, myIgnoringFragments);

        // Находим кратчайшие пути до всех вершин:
        myPoints.countShortWay(this.ignoringRoutes, myIgnoringFragments, time, types, goingSpeed, reservedTimeSeconds);

        var tmpP = myPoints.finalPoint;
        this.points.push(tmpP.toString());////
        while (tmpP.previousPoint != null) {
            tmpP = tmpP.previousPoint;//
            this.points.push(tmpP.toString());
            if (tmpP.previousPoint == null && tmpP.coords != myPoints.startPoint.coords)
                throw new Exception("Где-то удалилась часть маршрута...");
        }

        this.totalTimeSeconds = myPoints.finalPoint.totalTimeSeconds;
        this.totalGoingTime = myPoints.finalPoint.getTotalGoingTime();
        this.totalTransportChangingCount = myPoints.finalPoint.getTotalTransportChangingCount();

        this.myPoints = myPoints;
        this.myIgnoringFragments = myIgnoringFragments;


        this.isVisited = false;
    }

    setVisited() {
        this.isVisited = true;
    }

}


class WayPoint {
    constructor(time, station, route, coords) {
        this.time = time;
        this.station = station == null ? null : { hashcode: station.hashcode, name: station.name, routes: null, Coords: { lat: station.coords.lat, lng: station.coords.lng } };
        this.route = route == null ? null : { vehicles: [], gpsTrack: null, hashcode: route.hashcode, number: route.number, type: route.type, from: route.from, to: route.to, owner: "", stations: null, timetables: null, stationsJSON: null }
        this.coords = coords;
    }
}
class OptimalWay {
    constructor(optimalRoute) {
        this.totalTimeSeconds = optimalRoute.totalTimeSeconds;
        this.totalGoingTimeSeconds = optimalRoute.totalGoingTime;
        this.totalTransportChangingCount = optimalRoute.totalTransportChangingCount;
        this.points = new Array();
        var optRoutePoints = optimalRoute.myPoints;
        
        for (var tmpP = optimalRoute.myPoints.finalPoint; tmpP != null; tmpP = tmpP.previousPoint) {
            this.points.push(new WayPoint(tmpP.totalTimeSeconds, tmpP.station, tmpP.fromWhichRoute, tmpP.coords));
        }
        this.points.reverse();
    }

}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// End algorithm.
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


router.get('/', function (req, res, next) {

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
        var my_speed = parseFloat(req.query.goingSpeed);
        if (my_speed == undefined || my_speed == null || my_speed <= 1) my_speed = 5;
        var my_dopTimeMinutes = parseFloat(req.query.dopTimeMinutes);
        if (my_dopTimeMinutes == undefined || my_dopTimeMinutes == null || my_dopTimeMinutes < 0) my_dopTimeMinutes = 2;

        var types = null;
        if (req.query.transportTypes != undefined) types = req.query.transportTypes.split(',');
        if (types == undefined || types == null) types = ["bus", "trolleybus"];


        //var findedOptimalWays = null;
        //var totalTimePercent = 1;
        //var totalGoingTimePercent = 1;
        //var totalTransportChangingCountPercent = 1;

        //var sortedArr = new Array();
        //var minimalTimeSeconds = 0;
        //var minimalGoingTimeSeconds = 0;
        //var minimalTransportChangingCount = 0;


        var startInitializingMoment = Date.now();

        if (global.initialized) {

            var tmpMyDate = new Date();

            //var fromPositionStr = fromPosition.lat + "," + fromPosition.lng;
            //var toPositionStr = toPosition.lat + "," + toPosition.lng;
            //var typesStr = (types == null || types.length == 0) ? null : types[0];
            //for (var i = 1, n = types.length; i < n; i++) typesStr += "," + types[i];
            //var hour = Math.floor(myStartTime / 3600);
            //var minute = Math.floor((myStartTime - 3600 * hour) / 60);
            //var myStartTimeStr = hour + ":" + minute;

            //var paramsStr = "from=" + fromPositionStr + "&to=" + toPositionStr + "&startTime=" + myStartTimeStr + "&dopTimeMinutes=" + my_dopTimeMinutes + "&goingSpeed=" + my_speed + "&transportTypes=" + typesStr;


            //console.log("Start finding oprimal routes. Params: " + paramsStr);

            var result = new OptimalRoutesCollection(fromPosition, toPosition, myStartTime, types, my_speed, my_dopTimeMinutes);
            var findedOptimalWays = result.getOptimalWays();

            console.log("Finded " + findedOptimalWays.length + " optimal routes. Time = " + (Date.now() - startInitializingMoment) + " ms.");

            res.json(findedOptimalWays);
        }
        else res.json(null);
    }
});

module.exports = router;