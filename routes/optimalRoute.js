var express = require('express');
var router = express.Router();






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


function getStationsAround(coords, radius) {
    var result = new Array();
    for (var i = 0, n = global.allStations.length, s = global.allStations[0]; i < n; s = global.allStations[++i]) {
        if (s != null && distance(s.coords, coords) < radius) result.push(s);
    }
    return result;
}

const TableType = { table: 1, periodic: 2 };

class Point {
    constructor(totalTimeSeconds, station_or_crds, fromWhichStation, fromWhichRoute) {
        if (station_or_crds.hashcode != undefined) {
            this.station = station_or_crds;
            this.stationCode = station_or_crds.hashcode;
            station_or_crds.point = this;
            this.coords = station_or_crds.coords;
        }
        else {
            this.coords = station_or_crds;
            this.station = null;
            this.stationCode = null;
        }
        this.totalTimeSeconds = totalTimeSeconds;
        this.fromWhichStation = fromWhichStation;
        this.fromWhichRoute = fromWhichRoute;

        this.isVisited = false;

        this.previousPoint = null;
    }
    tryUpdate(totalTimeSeconds, previousPoint, fromWhichStation, fromWhichRoute) {
        if (totalTimeSeconds < this.totalTimeSeconds) {
            this.fromWhichRoute = fromWhichRoute;
            this.previousPoint = previousPoint;
            this.totalTimeSeconds = totalTimeSeconds;
            this.fromWhichStation = fromWhichStation;

            return true;
        }
        return false;
    }
    setVisited() {
        this.isVisited = true;
    }
    toString() {
        var from, to, tr, p;
        if (this.fromWhichStation != null) from = this.fromWhichStation.name;
        else from = "null";
        if (this.station != null) to = this.station.name;
        else to = "null";
        if (this.fromWhichRoute != null) tr = this.fromWhichRoute.type + " " + this.fromWhichRoute.number + " " + this.fromWhichRoute.from + " - " + this.fromWhichRoute.to;
        else tr = "пешком";
        if (this.previousPoint != null) p = this.previousPoint.toString();
        else p = "null";
        return /*p+" -->> */"(" + this.totalTimeSeconds + ") " + to + " (" + tr + ")"; // from " + from + " to
    }
    getTotalGoingTime() {
        var goingTime = 0;
        var tmpP = this;
        //this.points.Add(tmpP.ToString());
        while (tmpP.previousPoint != null) {
            if (tmpP.fromWhichRoute == null /*&& tmpP.fromWhichRoute.hashcode == null*/) goingTime += tmpP.totalTimeSeconds - tmpP.previousPoint.totalTimeSeconds;
            tmpP = tmpP.previousPoint;
        }
        return goingTime;
    }
    getTotalTransportChangingCount() {
        var result = 0;
        var tmpP = this;
        //this.points.Add(tmpP.ToString());
        while (tmpP.previousPoint != null) {
            if (tmpP.fromWhichRoute != null && tmpP.fromWhichRoute.hashcode != null && tmpP.fromWhichRoute != tmpP.previousPoint.fromWhichRoute) result++;
            tmpP = tmpP.previousPoint;
        }
        return result;
    }
}

class Points {
    constructor(startPoint, finalPoint) {
        this.collection = new Array();
        this.startPoint = startPoint;
        this.finalPoint = finalPoint;
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


class IgnoringFragments {
    constructor() {
        this.prototype = Object.create(Array.prototype);
        if (arguments[0] != undefined && arguments[0] != null && arguments[0].length != 0) {
            try {
                this.prototype = this.prototype.concat(arguments[0]);
            }
            catch (ex) {
                console.log(ex.message);
            }
        }
    }
    contains(stationCode, routeCode, fromStationCode) {
        for (var i = 0, n = this.prototype.length, r = this.prototype[0]; i < n; r = this.prototype[++i]) {
            if (r.routeCode == routeCode && r.stationCode == stationCode && r.fromStationCode == fromStationCode) return true;
        }
        return false;
    }
}

class OptimalRoutesCollection extends Array {
    constructor() {
        super();
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
        //if (types == null) types = new RouteType[] { RouteType.bus, RouteType.trolleybus, /*RouteType.tram, RouteType.metro, RouteType.express_bus, RouteType.marsh*/ };
        this.types = types;//{ RouteType.bus };//

        var myIgnoringFragments = null;
        if (ignoringList != null) myIgnoringFragments = new IgnoringFragments(ignoringList);
        else myIgnoringFragments = new IgnoringFragments();

        var myStartPoint = new Point(0, nowPos, null, null);
        var myFinishPoint = new Point(2160000000, needPos, null, null);
        myFinishPoint.tryUpdate(getTimeForGoingTo(distance(nowPos, needPos), goingSpeed) + 1200/*+ TimeSpan.FromMinutes(20)*/, myStartPoint, null, null);//!!!!!!!!!!!!!!!!!
        //myFinishPoint.tryUpdate(getTimeForGoingTo(GoogleApi.GetWalkingDistance(nowPos, needPos), goingSpeed), myStartPoint, null, null);
        var myPoints = new Points(myStartPoint, myFinishPoint);
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

    static findOptimalRoutes(nowPos, needPos, time, types, speed, dopTimeMinutes) {
        var findedOptimalRoutes = new OptimalRoutesCollection();

        findedOptimalRoutes.push(new OptimalRoute(nowPos, needPos, time, types, speed, dopTimeMinutes));

        var ignoringRoutes = new Array();

        var ignoringFragments = new IgnoringFragments();

        for (var selectedOptimalRoute = findedOptimalRoutes[0]; selectedOptimalRoute != null; selectedOptimalRoute.setVisited(), selectedOptimalRoute = findedOptimalRoutes.selectOptimalRouteWithMinimalMark()) {
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

                if (tmpOptimalRoute.totalTimeSeconds <= findedOptimalRoutes[0].totalTimeSeconds / ddd) {
                    var tmpJSON = JSON.stringify(tmpOptimalRoute.points);
                    var ok = false;
                    for (var j = 0, m = findedOptimalRoutes.length, opt = findedOptimalRoutes[0]; j < m; opt = findedOptimalRoutes[++j]) {
                        if (JSON.stringify(opt.points) == tmpJSON) {
                            ok = true;
                            break;
                        }
                    }
                    if (ok) continue;
                    findedOptimalRoutes.push(tmpOptimalRoute);
                }
            }
        }
        return findedOptimalRoutes;
    }

}


class WayPoint {
    constructor(time, station, route, coords) {
        /*try
        {*/
        this.time = time;//.toString();
        this.station = station == null ? null : { hashcode: station.hashcode, name: station.name, routes: null, Coords: { lat: station.coords.lat, lng: station.coords.lng } };//station.name;//new Station(station.hashcode, station.nameRus, station.nameEn, station.nameBy, (int)(10000 * station.lat), (int)(10000 * station.lng), null, station.name); //station;
        this.route = route == null ? null : { vehicles: [], gpsTrack: null, hashcode: route.hashcode, number: route.number, type: route.type, from: route.from, to: route.to, owner: "", stations: null, timetables: null, stationsJSON: null }//route.from + " - " + route.to//new Route(route.hashcode, JsonConvert.SerializeObject(new string[] { route.from, route.to }), JsonConvert.SerializeObject(new string[] { route.from, route.to }), JsonConvert.SerializeObject(new string[] { route.from, route.to }), JsonConvert.SerializeObject(new string[] { route.from, route.to }), null, route.number, route.type, route.owner); //route;
        this.coords = coords;
        /*}
        catch (Exception ex)
        {

        }*/
    }
}
class OptimalWay {
    constructor(optimalRoute) {
        this.totalTimeSeconds = optimalRoute.totalTimeSeconds;
        this.totalGoingTimeSeconds = optimalRoute.totalGoingTime;
        this.totalTransportChangingCount = optimalRoute.totalTransportChangingCount;
        this.points = new Array();
        var optRoutePoints = optimalRoute.myPoints;
        //this.points.push(new WayPoint(optRoutePoints.startPoint.totalTimeSeconds, optRoutePoints.startPoint.station, optRoutePoints.startPoint.fromWhichRoute, optRoutePoints.startPoint.coords));

        //var tmp = new Array();
        for (var tmpP = optimalRoute.myPoints.finalPoint; tmpP/*.previousPoint*/ != null; tmpP = tmpP.previousPoint) {
            this.points.push(new WayPoint(tmpP.totalTimeSeconds, tmpP.station, tmpP.fromWhichRoute, tmpP.coords));
        }
        this.points.reverse();
        //this.points.concat(tmp);

        /*foreach (OptimalRoute.Points.Point p in optRoutePoints)
        {
            points.Add(new WayPoint(p.Station, p.fromWhichRoute, p.coords));
        }
        points.Add(new WayPoint(optRoutePoints.finalPoint.Station, optRoutePoints.finalPoint.fromWhichRoute, optRoutePoints.finalPoint.coords));*/
    }

}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// End algorithm.
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////




/* GET users listing. */
router.get('/', function (req, res, next) {
    var findedOptimalWays = null;
    var totalTimePercent = 1;
    var totalGoingTimePercent = 1;
    var totalTransportChangingCountPercent = 1;

    var sortedArr = new Array();
    var minimalTimeSeconds = 0;
    var minimalGoingTimeSeconds = 0;
    var minimalTransportChangingCount = 0;


    var startInitializingMoment = Date.now();
    //?from=53.6858,23.8315&to=53.6361,23.8630&startTime=12:46&dopTimeMinutes=2&goingSpeed=5&transportTypes=bus,trolleybus
    var fromPosition = { lat: 53.6848, lng: 23.8402 };//{ lat: 53.6858, lng: 23.8315 };
    var toPosition = { lat: 53.7084, lng: 23.8026 };//{ lat: 53.6361, lng: 23.8630 };//{lat : 53.7084, lng: 23.8025};//
    var myStartTime = 46000;
    var types = ["bus", "trolleybus"];
    var my_speed = 5;
    var my_dopTimeMinutes = 2;

    if (global.initialized) {

        var tmpMyDate = new Date();

        myStartTime = hour * 3600 + minute * 60;
        myStartTime = 18 * 3600 + 0 * 60;

        myStartTime = tmpMyDate.getHours() * 3600 + (tmpMyDate.getMinutes() + 1) * 60;

        var fromPositionStr = fromPosition.lat + "," + fromPosition.lng;
        var toPositionStr = toPosition.lat + "," + toPosition.lng;
        var typesStr = (types == null || types.length == 0) ? null : types[0];
        for (var i = 1, n = types.length; i < n; i++) typesStr += "," + types[i];
        var hour = Math.floor(myStartTime / 3600);
        var minute = Math.floor((myStartTime - 3600 * hour) / 60);
        var myStartTimeStr = hour + ":" + minute;

        var paramsStr = "from=" + fromPositionStr + "&to=" + toPositionStr + "&startTime=" + myStartTimeStr + "&dopTimeMinutes=" + my_dopTimeMinutes + "&goingSpeed=" + my_speed + "&transportTypes=" + typesStr;



        console.log("Start finding oprimal routes. Params: " + paramsStr);
        //for (var i = 0; i < 100; i++)
        var result = OptimalRoute.findOptimalRoutes(fromPosition, toPosition, myStartTime, types, my_speed, my_dopTimeMinutes);
        findedOptimalWays = result.getOptimalWays();
        //console.log("\n\n"+JSON.stringify(res.getOptimalWays()));
        console.log("Finded " + findedOptimalWays.length + " optimal routes. Time = " + (Date.now() - startInitializingMoment) + " ms.");

        //customizeFindedOptimalWaysStart(totalTimePercent, totalGoingTimePercent, totalTransportChangingCountPercent);
        //res.json(null);
        //console.log(JSON.stringify(findedOptimalWays));
        res.json(findedOptimalWays);

    }
    else res.json(null);
});

module.exports = router;