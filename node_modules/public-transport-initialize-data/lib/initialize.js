"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
//import 'regenerator-runtime/runtime';
//import 'babel-polyfill';

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Initailize.
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function getNextStation(currentStation) {
    for (var j = 0, thisStations = this.stations[0]; j <= 1; thisStations = this.stations[j = 1]) {
        for (var t = 0, nn = thisStations.length; t < nn; t++) {
            if (thisStations[t] === currentStation) {
                if (t + 1 !== nn) return thisStations[t + 1];else return null;
            }
        }
    }
    return null;
}
function getPreviousStation(currentStation) {
    for (var j = 0, thisStations = this.stations[0]; j <= 1; thisStations = this.stations[j = 1]) {
        for (var t = 0, nn = thisStations.length; t < nn; t++) {
            if (thisStations[t] === currentStation) {
                if (t !== 0) return thisStations[t - 1];else return null;
            }
        }
    }
    return null;
}
function getTimetable(station) {
    for (var j = 0, thisStations = this.stations[0]; j <= 1; thisStations = this.stations[j = 1]) {
        for (var i = 0, n = thisStations.length; i < n; i++) {
            if (thisStations[i] === station) {
                return this.timetables[j][i];
            }
        }
    }
    return null;
}
function findTimeAfter(time) {
    var dateTmp = new Date();
    dateTmp.setMinutes(0);
    dateTmp.setHours(0);
    dateTmp.setSeconds(time);
    var day = dateTmp.getDay();

    for (var kkk = 0, mnkk = this.table.length, t = this.table[0]; kkk < mnkk; t = this.table[++kkk]) {
        if (t.days.includes(day)) {

            //TODO: Здесь можно ускорить поиск, поскольку массив t.times отсортирован по возрастанию.
            /*for (let iik = 0, mnii = t.times.length, st = t.times[0], stTime; iik < mnii; st = t.times[++iik]) {
                stTime = st.hour * 3600 + st.minute * 60;
                if (stTime >= time) {
                    return stTime - time;
                }
            }*/
            var findedTime = binaryFind(t.times, function (element, index, array) {
                var stTime = element.hour * 3600 + element.minute * 60,
                    previous = array[index - 1];
                if (stTime >= time && (previous == null || previous.hour * 3600 + previous.minute * 60 < time)) return 0;else if (stTime >= time) return 1;else return -1;
            });
            if (findedTime != null) return findedTime.hour * 3600 + findedTime.minute * 60 - time;

            /*do {
                dateTmp = new Date();
                dateTmp.setSeconds(86400);
                day = dateTmp.getDay();
            } while (t.days.includes(day));*/

            //TODO: Здесь следует перейти к расписанию следующего дня и искать там.
            if (t.times.length !== 0) return t.times[0].hour * 3600 + t.times[0].minute * 60 + 86400 - time;
            break;
        }
    }
    return 2160000000;
}
function findTimeBefore(time) {
    var dateTmp = new Date();
    dateTmp.setMinutes(0);
    dateTmp.setHours(0);
    dateTmp.setSeconds(time);
    var day = dateTmp.getDay();
    for (var kkk = 0, mnkk = this.table.length, t = this.table[0], ok = false, st; kkk < mnkk; t = this.table[++kkk]) {
        if (t.days.includes(day)) {

            //TODO: Здесь можно ускорить поиск, поскольку массив t.times отсортирован по возрастанию.
            for (var iik = t.times.length - 1, stt = t.times[iik], stTime; iik >= 0; stt = t.times[--iik]) {
                stTime = stt.hour * 3600 + stt.minute * 60;
                if (stTime <= time) {
                    return stTime - time;
                }
            }

            //TODO: Здесь следует перейти к расписанию предыдущего дня и искать там.
            if (t.times.length !== 0) return t.times[t.times.length - 1].hour * 3600 + t.times[t.times.length - 1].minute * 60 - 86400 - time;
            break;
        }
    }
    return 0;
}

function binaryFind(array, predicateForArrayItem) {
    var i = 0,
        j = array.length,
        k = void 0,
        predicateResult = void 0,
        currentItem = void 0;

    while (i < j) {
        k = Math.floor((i + j) / 2);
        currentItem = array[k];
        predicateResult = predicateForArrayItem(currentItem, k, array);

        if (predicateResult === 0) return currentItem;else if (predicateResult === 1) j = k;else i = k + 1;
    }
    return null;
}

function initialize(allStations, allRoutes, allTimetables) {
    console.log("Start initializing...");
    var startInitializingMoment = Date.now();

    function bindRoutesStationsTimetables(station, tmpArr, tabArr, rrr) {
        if (station.routes == null) station.routes = [];
        //console.log(station.routes);//!!!
        if (!station.routes.includes(rrr)) station.routes.push(rrr);
        tmpArr.push(station);

        var stationCode = station.hashcode,
            routeCode = rrr.hashcode;

        /*var tmp = allTimetables.find(function (element, index, array) {
            return element.stationCode === stationCode && element.routeCode === routeCode;
        });*/

        var tmp = binaryFind(allTimetables, function (element, index, array) {
            if (element.stationCode > stationCode) return 1;else if (element.stationCode === stationCode) {
                if (element.routeCode === routeCode) return 0;else if (element.routeCode > routeCode) return 1;
                return -1;
            }
            return -1;
        });

        var tmpTab = tmp == null ? null : tmp;

        tabArr.push(tmpTab);
    }

    // Удаляем станции, через которые не идет ни один маршрут
    var newAllStations = [];
    for (var i = 0, n = allStations.length, currentStation = allStations[0]; i < n; currentStation = allStations[++i]) {
        if (currentStation.routesCodes != null && currentStation.routesCodes.length !== 0) {
            newAllStations.push(currentStation);
        }
    }
    allStations = newAllStations;

    /*for(let i = 1, n = allStations.length; i < n; i++){
        if(allStations[i-1].hashcode > allStations[i].hashcode) console.log(allStations[i-1].hashcode + " > " + allStations[i].hashcode);
    }*/

    //var startInitializingMoment2 = Date.now();


    for (var _i = 0, _n = allRoutes.length, currentRoute = allRoutes[0]; _i < _n; currentRoute = allRoutes[++_i]) {

        currentRoute.getNextStation = getNextStation;
        currentRoute.getPreviousStation = getPreviousStation;
        currentRoute.getTimetable = getTimetable;

        var currentRouteStationsCodes = currentRoute.stationsCodes;

        if (currentRouteStationsCodes == null || currentRouteStationsCodes.length === 0) {
            continue;
        }

        try {

            currentRoute.stations = [[], []];
            currentRoute.timetables = [[], []];

            for (var index = 0, tmpArr = [], tabArr = []; index <= 1; index++) {

                if (currentRouteStationsCodes[index] == null || currentRouteStationsCodes[index].length === 0) continue;

                var _loop = function _loop(j, m, stationCode) {

                    /*for (let k = 0, mn = allStations.length, station = allStations[0]; k < mn; station = allStations[++k]) {
                        if (station != null && station.hashcode === stationCode) {
                            bindRoutesStationsTimetables(station, tmpArr, tabArr, currentRoute);
                            console.log("ok");
                            break;
                        }
                    }*/

                    var findedStation = binaryFind(allStations, function (element, index, array) {
                        if (element.hashcode === stationCode) return 0;else if (element.hashcode > stationCode) return 1;else return -1;
                    });
                    if (findedStation != null) {
                        bindRoutesStationsTimetables(findedStation, tmpArr, tabArr, currentRoute);
                    }
                    //else console.log("findedStation == null");


                    /*for (let a = 0, b = allStations.length, k = Math.floor(b/2), currentItem = allStations[k]; a < b; currentItem = allStations[k = Math.floor((a+b)/2)]){
                        if (currentItem.hashcode === stationCode){
                            bindRoutesStationsTimetables(currentItem, tmpArr, tabArr, currentRoute);
                            break;
                        }
                        else if (currentItem.hashcode > stationCode) b = k;
                        else a = k+1;
                    }*/
                };

                for (var j = 0, m = currentRouteStationsCodes[index].length, stationCode = currentRouteStationsCodes[index][0]; j < m; stationCode = currentRouteStationsCodes[index][++j]) {
                    _loop(j, m, stationCode);
                }
                currentRoute.stations[index] = tmpArr;
                currentRoute.timetables[index] = tabArr;
            }
        } catch (ex) {
            console.log(ex);
            continue;
        }
    }

    //console.log("Time = " + (Date.now() - startInitializingMoment2) + " ms.");

    for (var _i2 = 0, _n2 = allTimetables.length, timetable = allTimetables[0]; _i2 < _n2; timetable = allTimetables[++_i2]) {
        timetable.findTimeAfter = findTimeAfter;
        timetable.findTimeBefore = findTimeBefore;
    }

    console.log("Initialized. Time = " + (Date.now() - startInitializingMoment) + " ms.");
    //console.log(allTimetables);
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// End initailize.
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

exports.default = initialize;