var express = require('express');
var router = express.Router();

var Point = require('../modules/point');






///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Algorithm.
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/*class GeoCoords {

}*/

function distance(a, b) {
    const earthRadius = 6372795;
    const pi180 = 0.017453;// 29251//Math.Round(Math.PI / 180, 5);
    var zz = 1, yy = 1;
    function taylorSin(x) {
        yy = x * x;
        zz = x;
        return zz - (zz *= yy) / 6 + (zz *= yy) / 120;
    }
    function taylorCos(x) {
        yy = x * x;
        zz = yy;
        return 1 - (yy) / 2 + (zz *= yy) / 24;
    }
    function taylorAtan(x) {
        yy = x * x;
        zz = x;
        return zz - (zz *= yy) / 3 + (zz *= yy) / 5 - (zz *= yy) / 7 + (zz *= yy) / 9 - (zz *= yy) / 20;
    }

    // перевести координаты в радианы
    var lat1 = a.lat * pi180;
    var lat2 = b.lat * pi180;
    var long1 = a.lng * pi180;
    var long2 = b.lng * pi180;

    // косинусы и синусы широт и разницы долгот
    var cl1 = taylorCos(lat1);
    var cl2 = taylorCos(lat2);
    var sl1 = taylorSin(lat1);
    var sl2 = taylorSin(lat2);
    var delta = long2 - long1;
    var cdelta = taylorCos(delta);
    var sdelta = taylorSin(delta);

    // вычисления длины большого круга
    var tmp = cl2 * cdelta;
    var y = Math.sqrt(cl2 * cl2 * sdelta * sdelta + (cl1 * sl2 - sl1 * tmp) * (cl1 * sl2 - sl1 * tmp));
    var x = sl1 * sl2 + cl1 * tmp;

    //
    var ad = Math.atan2(y, x);//taylorAtan(y/x);
    var dist = Math.ceil(ad * earthRadius);//(int)Math.Round(ad * earthRadius, 0);

    return dist;
}

function getTimeForGoingTo(distance, goingSpeed) {
    return Math.floor(distance / (goingSpeed / 3.6));
}




class Points {
    constructor(nowPos, needPos) {
        this.collection = new Array();
        this.startPoint = new Point(0, nowPos, null, null);
        this.finalPoint = new Point(2160000000, needPos, null, null);
        this.currentSelectedPoint = null;
    }
    findElement(station_or_point) {
        if (station_or_point.hashcode != undefined) {
            if (station_or_point.point != null) return station_or_point.point;
            var newCreatdPoint = new Point(2160000000, station_or_point, null, null);
            this.collection.push(newCreatdPoint);
            return newCreatdPoint;
        }
        else {
            for (var i = 0, n = this.collection.length, p = this.collection[0]; i < n; p = this.collection[++i]) {
                if (p.coords == point.coords && p.stationCode == station_or_point.stationCode) return p;
            }
            return null;
        }
    }
    fillStartData(stationsList, goingSpeed, reservedTime, myIgnoringFragments) {
        this.finalPoint.tryUpdate(getTimeForGoingTo(distance(this.startPoint.coords, this.finalPoint.coords), goingSpeed) + 1200/*+ TimeSpan.FromMinutes(20)*/, this.startPoint, null, null);
        for (var i = 0, n = stationsList.length, st = stationsList[0]; i < n; st = stationsList[++i]) {
            if (myIgnoringFragments != null && myIgnoringFragments.contains(st.hashcode, null, null)) continue;

            var add = new Point(2160000000, st, null, null);
            add.tryUpdate(getTimeForGoingTo(distance(this.startPoint.coords, st.coords), goingSpeed) + reservedTime, this.startPoint, null, null);
            this.collection.push(add);
        }
    }
    getNextUnvisitedPoint() {
        if (this.currentSelectedPoint != null) this.currentSelectedPoint.setVisited();

        this.currentSelectedPoint = this.selectPointWithMinimalMark();

        return this.currentSelectedPoint;
    }
    selectPointWithMinimalMark() {
        var p = null;
        for (var i = 0, n = this.collection.length, t = this.collection[0]; i < n; t = this.collection[++i]) {
            if (!(t.isVisited)) {
                p = t;
                for (t = this.collection[++i]; i < n; t = this.collection[++i]) {
                    if (!(t.isVisited) && t.totalTimeSeconds < p.totalTimeSeconds) {
                        p = t;
                    }
                }
                return p;
            }
        }
        return null;
    }
    countShortWay(ignoringRoutes, myIgnoringFragments, time, types, speed, reservedTime) {
        //TimeSpan overLimitResedvedTime = TimeSpan.FromMinutes(20);

        for (var selectedPoint = this.getNextUnvisitedPoint(), selectedPointStation, selectedPointTotalTimeSeconds, selectedPointStationHashcode, selectedPointFromWhichRoute, momentWhenComingToStation, routesOnStation, selectedPointCoords; selectedPoint != null; selectedPoint = this.getNextUnvisitedPoint()) {
            //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            if ((selectedPointTotalTimeSeconds = selectedPoint.totalTimeSeconds) > this.finalPoint.totalTimeSeconds/* + overLimitResedvedTime*/) //... Пропускаем и удаляем, если значение метки превышает минимальное время до пункта назначения.
            {
                break;
            }
            selectedPointStation = selectedPoint.station;
            selectedPointStationHashcode = selectedPointStation.hashcode;
            selectedPointFromWhichRoute = selectedPoint.fromWhichRoute;
            if (selectedPointStation != null) {
                // Момент, когда мы прибудем на остановку:
                momentWhenComingToStation = time + selectedPointTotalTimeSeconds;
                // Загружаем маршруты, проходящие через остановку:
                routesOnStation = null;// = routesOnStation = Database.GetRoutesOnStation(selectedPointStation.hashcode, canReadDataFromLocalCopy: true);
                if (selectedPointStation.routes != null) routesOnStation = selectedPointStation.routes;
                else continue;

                for (var i = 0, n = routesOnStation.length, selectedRoute = routesOnStation[0], nextStation; i < n; selectedRoute = routesOnStation[++i]) {
                    if (ignoringRoutes != null && ignoringRoutes.includes(selectedRoute)) continue;
                    if (types.includes(selectedRoute.type)) {
                        // Следующая остановка у данного тран спорта:
                        nextStation = selectedRoute.getNextStation(selectedPointStation);

                        /*// Код остановки, на которую попадем на данном транспорте:
                        string nextCode = selectedRoute.getNextStationCodeAfter(selectedPointStation.hashcode, canReadDataFromLocalCopy: true);*/
                        if (nextStation/*nextCode*/ != null) // Если остановка не является конечной, то:
                        {
                            // Загружаем расписание:
                            var table = selectedRoute.getTimetable(selectedPointStation);//Database.getTimetable(selectedPointStation.hashcode, selectedRoute.hashcode, databaseMysqlConnection, canReadDataFromLocalCopy: true);
                            // Блокируем попытку попасть указанным транспортом на указанную остановку:
                            if (myIgnoringFragments.contains(nextStation.hashcode/*nextCode*/, selectedRoute.hashcode, selectedPointStationHashcode)) continue;

                            if (table.type == TableType.table) // Если это точное расписание, то:
                            {
                                // Минимальный начальный момент, с который можно начинать ожидать посадку:
                                var momentWhenAskingForGoing = momentWhenComingToStation;

                                // Резервируем дополнительное время, если будем пересаживаться на другой маршрут:
                                //if (selectedPoint.RouteCode == null || selectedPoint.RouteCode != selectedRoute.hashcode) momentWhenAskingForGoing += reservedTime;
                                if (selectedPointFromWhichRoute != null && selectedPointFromWhichRoute != selectedRoute) momentWhenAskingForGoing += reservedTime;

                                // Подсчитываем, сколько будем ожидать этот транспорт на остановке:
                                var waitingTime = table.findTimeAfter(momentWhenAskingForGoing);

                                // Момент, когда мы сядем в транспорт:
                                var momentWhenSitInTransport = momentWhenAskingForGoing + waitingTime;

                                /*// Следующая остановка у данного транспорта:
                                Station nextStation = Database.GetStationByHashcode(nextCode, databaseMysqlConnection, canReadDataFromLocalCopy: true);*/

                                // И соответствующее расписание на этой остановке:
                                var tbl = selectedRoute.getTimetable(nextStation);//Database.getTimetable(nextStation.hashcode, selectedRoute.hashcode, databaseMysqlConnection, canReadDataFromLocalCopy: true);
                                
                                // (сколько будем ехать до следующей остановки):
                                var goingOnTransportTime = tbl.findTimeAfter(momentWhenSitInTransport);
                                
                                // Метка времени:
                                var onNextPointtotalTimeSeconds = momentWhenSitInTransport - momentWhenComingToStation + goingOnTransportTime + selectedPointTotalTimeSeconds;
                                
                                if (this.findElement(nextStation).tryUpdate(onNextPointtotalTimeSeconds, selectedPoint, selectedPointStation, selectedRoute)) {
                                    //console.log("upd...");
                                }
                            }
                            else if (table.type == TableType.periodic) {
                                throw new NotImplementedException();
                            }
                        }
                    }
                }
            }
            selectedPointCoords = selectedPoint.coords;
            // Нет смысла идти пешком "транзитом" через остановку:
            if (selectedPointFromWhichRoute == null) continue;

            // Попробуем пройти пешком до других "вершин":
            for (var j = 0, m = this.collection.length, p = this.collection[0], distanceToSelectedPoint, goingTime, newTime; j < m; p = this.collection[++j])
                if (!p.isVisited && p != selectedPoint) {
                    // Блокируем попытку дойти пешком до указанной остановки:
                    if (myIgnoringFragments.contains(p.stationCode, null, selectedPointStationHashcode)) continue;

                    distanceToSelectedPoint = distance(selectedPointCoords, p.coords);
                    
                    goingTime = getTimeForGoingTo(distanceToSelectedPoint, speed/*, true, sp*/);

                    newTime = selectedPointTotalTimeSeconds + goingTime + reservedTime;
                    /*if (p != myFinishPoint)*/ // newTime += reservedTime;
                    
                    if (p.tryUpdate(newTime, selectedPoint, selectedPointStation, null)) {
                        //console.log("upd...");
                    }
                }

            if (myIgnoringFragments.contains(null, null, selectedPointStationHashcode)) continue;
            
            var tryingNewTime = selectedPointTotalTimeSeconds + getTimeForGoingTo(distance(selectedPointCoords, this.finalPoint.coords), speed);
            if (this.finalPoint.tryUpdate(tryingNewTime, selectedPoint, selectedPointStation, null)) {
                //console.log("upd: " + selectedPointStation.hashcode);
            }
        }

        // Сокращаем время ходьбы пешком до минимума и избавляемся от "бессмысленных" пересадок, сохраняя общее время неизменным:
        var currentPoint = this.finalPoint.previousPoint;
        while (currentPoint != this.startPoint) {
            var r = currentPoint.fromWhichRoute;
            if (r != null) {
                var previousPoint = currentPoint.previousPoint;
                if (previousPoint != this.startPoint && previousPoint.fromWhichRoute != r) // Если на предыдущую остановку мы добрались другим транспортом, то:
                {
                    var previousRouteStation = r.getPreviousStation(previousPoint.station);
                    if (previousRouteStation != null) {
                        var point = previousRouteStation.point;
                        if (point != null && point.isVisited) {
                            var ttt = r.getTimetable(previousRouteStation);
                            if (ttt != null) {
                                var ddd = time + previousPoint.totalTimeSeconds;
                                var moment = r.getTimetable(currentPoint.station).findTimeAfter(ddd);
                                var tmp_time = ttt.findTimeBefore(ddd + moment);

                                var momentArriveOnCurrent = previousPoint.totalTimeSeconds + moment;
                                var momentSittingOnPrevious = momentArriveOnCurrent + tmp_time;
                                /*bool bbb = point.fromWhichRoute != null && point.fromWhichRoute.getTimetable(point.station) != null && point.fromWhichRoute.getTimetable(point.station).findTimeAfter(time + point.totalTimeSeconds) <= previousPoint.totalTimeSeconds + moment + tmp_time;
                                if (bbb)
                                {
                                    previousPoint.fromWhichRoute = r;
                                    previousPoint.previousPoint = point;////!bbb && point.totalTimeSeconds <= momentSittingOnPrevious &&
                                }
                                else */
                                if (/*point.totalGoingTime>=previousPoint.totalGoingTime || */point.totalTimeSeconds <= previousPoint.totalTimeSeconds/* && point.totalGoingTime <= previousPoint.totalGoingTime*/) {
                                    previousPoint.fromWhichRoute = r;
                                    previousPoint.previousPoint = point;
                                }
                            }
                        }
                    }
                }
            }
            currentPoint = currentPoint.previousPoint;
        }
    }


}


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

const TableType = { table: 1, periodic: 2 };

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