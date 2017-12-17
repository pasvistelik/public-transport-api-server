'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _dataProvider = require('public-transport-server-code/lib/dataProvider');

var _dataProvider2 = _interopRequireDefault(_dataProvider);

var _publicTransportServerCode = require('public-transport-server-code');

var _publicTransportServerCode2 = _interopRequireDefault(_publicTransportServerCode);

var _test = require('./tmp/test0');

var _test2 = _interopRequireDefault(_test);

var _grodnoRandomPointsCoords = require('./tmp/grodnoRandomPointsCoords');

var _grodnoRandomPointsCoords2 = _interopRequireDefault(_grodnoRandomPointsCoords);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express2.default.Router();

router.get('/', function _callee(req, res, next) {
    var strToCoords, strToSeconds, fromPosition, toPosition, myStartTime, oneWayOnly, my_speed, my_dopTimeMinutes, types, startInitializingMoment, tmpMyDate, fromPositionStr, toPositionStr, typesStr, i, n, hour, minute, myStartTimeStr, findedOptimalWays;
    return regeneratorRuntime.async(function _callee$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    _context.prev = 0;

                    strToCoords = function strToCoords(str) {
                        if (str == undefined || str == null) return undefined;
                        var tmp = str.split(',');
                        var myLat = parseFloat(tmp[0]);
                        var myLng = parseFloat(tmp[1]);
                        if (myLat >= -90 && myLat <= 90 && myLng >= -180 && myLng <= 180) return { lat: myLat, lng: myLng };else return undefined;
                    };

                    strToSeconds = function strToSeconds(str) {
                        if (str == undefined || str == null) return undefined;
                        var tmp = str.split(':');
                        var hours = parseInt(tmp[0]);
                        var minutes = parseInt(tmp[1]);
                        if (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) return 3600 * hours + 60 * minutes;else return undefined;
                    };

                    _context.next = 5;
                    return regeneratorRuntime.awrap(_dataProvider2.default.loadDataAndInitialize());

                case 5:
                    fromPosition = strToCoords(req.query.from);
                    toPosition = strToCoords(req.query.to);
                    myStartTime = strToSeconds(req.query.startTime);

                    if (!(fromPosition == undefined || toPosition == undefined || myStartTime == undefined)) {
                        _context.next = 12;
                        break;
                    }

                    res.json(null);
                    _context.next = 34;
                    break;

                case 12:
                    oneWayOnly = req.query.oneWayOnly == 'true';
                    my_speed = parseFloat(req.query.goingSpeed);

                    if (my_speed == undefined || my_speed == null || my_speed <= 1) my_speed = 5;
                    my_dopTimeMinutes = parseFloat(req.query.dopTimeMinutes);

                    if (my_dopTimeMinutes == undefined || my_dopTimeMinutes == null || my_dopTimeMinutes < 0) my_dopTimeMinutes = 2;

                    types = null;

                    if (req.query.transportTypes != undefined) types = req.query.transportTypes.split(',');
                    if (types == undefined || types == null) types = ["bus", "trolleybus"];

                    startInitializingMoment = Date.now();

                    //if (global.initialized) {

                    tmpMyDate = new Date();
                    fromPositionStr = fromPosition.lat + "," + fromPosition.lng;
                    toPositionStr = toPosition.lat + "," + toPosition.lng;
                    typesStr = types == null || types.length == 0 ? null : types[0];

                    for (i = 1, n = types.length; i < n; i++) {
                        typesStr += "," + types[i];
                    }hour = Math.floor(myStartTime / 3600);
                    minute = Math.floor((myStartTime - 3600 * hour) / 60);
                    myStartTimeStr = hour + ":" + minute;

                    //var paramsStr = "from=" + fromPositionStr + "&to=" + toPositionStr + "&startTime=" + myStartTimeStr + "&dopTimeMinutes=" + my_dopTimeMinutes + "&goingSpeed=" + my_speed + "&transportTypes=" + typesStr;


                    //console.log("Start finding oprimal routes. Params: " + paramsStr);

                    //var result = new OptimalRoutesCollection(fromPosition, toPosition, myStartTime, types, my_speed, my_dopTimeMinutes);


                    _context.next = 31;
                    return regeneratorRuntime.awrap(_publicTransportServerCode2.default.findWays(fromPositionStr, toPositionStr, myStartTimeStr, my_dopTimeMinutes, my_speed, typesStr, oneWayOnly));

                case 31:
                    findedOptimalWays = _context.sent;


                    if (findedOptimalWays != null) console.log("Finded " + findedOptimalWays.length + " optimal routes. Time = " + (Date.now() - startInitializingMoment) + " ms.");

                    res.json(findedOptimalWays);
                    //}
                    //else res.json(null);

                case 34:
                    _context.next = 40;
                    break;

                case 36:
                    _context.prev = 36;
                    _context.t0 = _context['catch'](0);

                    console.log(_context.t0);
                    res.json(null);

                case 40:
                case 'end':
                    return _context.stop();
            }
        }
    }, null, this, [[0, 36]]);
});

router.get('/tmp/:addDays', function _callee2(req, res, next) {
    var data, data1, tmp_data, _i, n, currentItem, addDays, t0, i, j, k, p, pointsLength, fromCoords, toCoords, fromCoordsStr, toCoordsStr, randomHour, randomMinute, timeStr, randomTripPassangersCount, findedOptimalWays, trCount, t, point, prevPoint, date, station_key, route_key, date_key;

    return regeneratorRuntime.async(function _callee2$(_context2) {
        while (1) {
            switch (_context2.prev = _context2.next) {
                case 0:
                    data = [], data1 = [];
                    tmp_data = [];


                    for (_i = 0, n = _test2.default.length, currentItem = _test2.default[0]; _i < n; currentItem = _test2.default[++_i]) {
                        if (tmp_data[currentItem.station_hashcode] == null) tmp_data[currentItem.station_hashcode] = [];
                        if (tmp_data[currentItem.station_hashcode][currentItem.route_hashcode] == null) tmp_data[currentItem.station_hashcode][currentItem.route_hashcode] = [];
                        tmp_data[currentItem.station_hashcode][currentItem.route_hashcode][currentItem.dispatch_datetime] = currentItem.count;
                    }

                    //console.log(tmp_data);

                    _context2.prev = 3;
                    addDays = parseInt(req.params.addDays);
                    t0 = Date.now();
                    _context2.next = 8;
                    return regeneratorRuntime.awrap(_dataProvider2.default.loadDataAndInitialize());

                case 8:
                    i = 0, j = 0, k = 0, p = 0;

                case 9:
                    if (!(j < 5000)) {
                        _context2.next = 35;
                        break;
                    }

                    if (!(i > 1000 && i > j * 3)) {
                        _context2.next = 12;
                        break;
                    }

                    return _context2.abrupt('break', 35);

                case 12:
                    pointsLength = _grodnoRandomPointsCoords2.default.length;
                    fromCoords = _grodnoRandomPointsCoords2.default[~~(Math.random() * (pointsLength - 1))];
                    toCoords = _grodnoRandomPointsCoords2.default[~~(Math.random() * (pointsLength - 1))];
                    fromCoordsStr = fromCoords.lat + "," + fromCoords.lng;
                    toCoordsStr = toCoords.lat + "," + toCoords.lng;
                    randomHour = ~~(Math.random() * 20 + 5); //~~(Math.random() * 23);

                    if (randomHour > 23) randomHour -= 24;
                    randomMinute = ~~(Math.random() * 59);
                    timeStr = randomHour + ":" + randomMinute;
                    randomTripPassangersCount = ~~(Math.random() * 10 + 1);
                    _context2.prev = 22;
                    _context2.next = 25;
                    return regeneratorRuntime.awrap(_publicTransportServerCode2.default.findWays(fromCoordsStr, toCoordsStr, timeStr, 3, 5, "bus,trolleybus", true));

                case 25:
                    findedOptimalWays = _context2.sent;


                    if (findedOptimalWays != null) {
                        trCount = findedOptimalWays[0].totalTransportChangingCount;

                        if (trCount > 0) {

                            p += randomTripPassangersCount;

                            console.log(j + ") [" + timeStr + "]: from (" + fromCoordsStr + ") to (" + toCoordsStr + "). tr = " + trCount + ", len ~= " + findedOptimalWays[0].points.length + ", p = " + randomTripPassangersCount);
                            k += findedOptimalWays[0].points.length;
                            j++;

                            for (t = 2; t < findedOptimalWays[0].points.length; t++) {
                                point = findedOptimalWays[0].points[t];

                                if (point.route != null) {
                                    prevPoint = findedOptimalWays[0].points[t - 1];
                                    date = new Date();

                                    date.setHours(0);
                                    date.setMinutes(0);
                                    date.setSeconds(0);
                                    date.setMilliseconds(0);

                                    date.setHours(randomHour);
                                    date.setMinutes(randomMinute);
                                    date.setSeconds(prevPoint.dispatchTime);

                                    date.setDate(date.getDate() + addDays);

                                    date = date.toISOString();

                                    data.push({
                                        station_hashcode: prevPoint.station.hashcode,
                                        route_hashcode: point.route.hashcode,
                                        dispatch_datetime: date
                                    });

                                    if (tmp_data[prevPoint.station.hashcode] == null) tmp_data[prevPoint.station.hashcode] = [];
                                    if (tmp_data[prevPoint.station.hashcode][point.route.hashcode] == null) tmp_data[prevPoint.station.hashcode][point.route.hashcode] = [];
                                    if (tmp_data[prevPoint.station.hashcode][point.route.hashcode][date] == null) {
                                        tmp_data[prevPoint.station.hashcode][point.route.hashcode][date] = randomTripPassangersCount;
                                    } else {
                                        tmp_data[prevPoint.station.hashcode][point.route.hashcode][date] += randomTripPassangersCount;
                                    }
                                }
                            }
                        }
                    }
                    _context2.next = 32;
                    break;

                case 29:
                    _context2.prev = 29;
                    _context2.t0 = _context2['catch'](22);

                    //...
                    console.log(_context2.t0);

                case 32:
                    i++;
                    _context2.next = 9;
                    break;

                case 35:

                    //console.log(tmp_data);

                    for (station_key in tmp_data) {
                        for (route_key in tmp_data[station_key]) {
                            for (date_key in tmp_data[station_key][route_key]) {
                                data1.push({
                                    station_hashcode: station_key,
                                    route_hashcode: route_key,
                                    dispatch_datetime: date_key,
                                    count: tmp_data[station_key][route_key][date_key]
                                });
                            }
                        }
                    }

                    console.log("TMP: " + (Date.now() - t0) + " ms, all = " + j + "(from " + i + "), k = " + data1.length + ", total passangers = " + p);

                    res.json(data1);
                    _context2.next = 44;
                    break;

                case 40:
                    _context2.prev = 40;
                    _context2.t1 = _context2['catch'](3);

                    console.log(_context2.t1);
                    res.json(null);

                case 44:
                case 'end':
                    return _context2.stop();
            }
        }
    }, null, this, [[3, 40], [22, 29]]);
});

router.get('/tmpsql', function _callee3(req, res, next) {
    var request, i, n, currentItem;
    return regeneratorRuntime.async(function _callee3$(_context3) {
        while (1) {
            switch (_context3.prev = _context3.next) {
                case 0:
                    request = "";


                    for (i = 0, n = _test2.default.length, currentItem = _test2.default[0]; i < n; currentItem = _test2.default[++i]) {
                        request += "INSERT IGNORE INTO `arrives_to_stations`(`passangers_count`, `date_time`, `station_id`, `way_id`) VALUES (" + currentItem.count + ",\"" + currentItem.dispatch_datetime + "\",(SELECT `station_id` FROM `stations` WHERE `tmp_station_hashcode`=\"" + currentItem.station_hashcode + "\" LIMIT 1),(SELECT `way_id` FROM `ways_vs_stations_relations` WHERE `station_id` = (SELECT `station_id` FROM `stations` WHERE `tmp_station_hashcode`=\"" + currentItem.station_hashcode + "\" LIMIT 1) AND `way_id` IN (SELECT `way_id` FROM `ways` WHERE `route_id`=(SELECT `route_id` FROM `routes` WHERE `tmp_route_hashcode`=\"" + currentItem.route_hashcode + "\" LIMIT 1)) LIMIT 1)); ";
                    }
                    res.send(request);

                case 3:
                case 'end':
                    return _context3.stop();
            }
        }
    }, null, this);
});

module.exports = router;