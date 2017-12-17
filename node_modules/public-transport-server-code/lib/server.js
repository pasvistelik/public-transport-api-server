'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _optimalRoutesCollection = require('public-transport-find-optimal-ways/lib/optimalRoutesCollection');

var _optimalRoutesCollection2 = _interopRequireDefault(_optimalRoutesCollection);

var _dataProvider = require('./dataProvider');

var _dataProvider2 = _interopRequireDefault(_dataProvider);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AppServer = function () {
    function AppServer() {
        _classCallCheck(this, AppServer);
    }

    _createClass(AppServer, null, [{
        key: 'findWays',

        // Find optimal ways between two points. The start time, reserved time, going speed and transport types are known.
        value: function findWays(fromPositionStr, toPositionStr, myStartTimeStr, my_dopTimeMinutes, my_speed, typesStr, oneWayOnly) {
            var findedOptimalWays, minimalTimeSeconds, minimalGoingTimeSeconds, minimalTransportChangingCount, i;
            return regeneratorRuntime.async(function findWays$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            findedOptimalWays = null;
                            minimalTimeSeconds = 0;
                            minimalGoingTimeSeconds = 0;
                            minimalTransportChangingCount = 0;
                            _context.prev = 4;
                            _context.next = 7;
                            return regeneratorRuntime.awrap(getCountedWays(fromPositionStr, toPositionStr, myStartTimeStr, my_dopTimeMinutes, my_speed, typesStr, oneWayOnly));

                        case 7:
                            findedOptimalWays = _context.sent;

                        case 8:
                            _context.prev = 8;

                            if (findedOptimalWays != null && findedOptimalWays.length !== 0) {

                                minimalTimeSeconds = parseFloat(findedOptimalWays[0].totalTimeSeconds);
                                minimalGoingTimeSeconds = parseFloat(findedOptimalWays[0].totalGoingTimeSeconds);
                                minimalTransportChangingCount = parseFloat(findedOptimalWays[0].totalTransportChangingCount);
                                for (i = 1; i < findedOptimalWays.length; i++) {
                                    if (parseFloat(findedOptimalWays[i].totalTimeSeconds) < minimalTimeSeconds) minimalTimeSeconds = parseFloat(findedOptimalWays[i].totalTimeSeconds);
                                    if (parseFloat(findedOptimalWays[i].totalGoingTimeSeconds) < minimalGoingTimeSeconds) minimalGoingTimeSeconds = parseFloat(findedOptimalWays[i].totalGoingTimeSeconds);
                                    if (parseFloat(findedOptimalWays[i].totalTransportChangingCount) < minimalTransportChangingCount) minimalTransportChangingCount = parseFloat(findedOptimalWays[i].totalTransportChangingCount);
                                }
                                if (minimalTransportChangingCount < 1) minimalTransportChangingCount = 1;
                            }
                            return _context.abrupt('return', findedOptimalWays);

                        case 12:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, null, this, [[4,, 8, 12]]);
        }
    }]);

    return AppServer;
}();

function strToCoords(str) {
    if (str === undefined || str == null) return undefined;
    var tmp = str.split(',');
    var myLat = parseFloat(tmp[0]);
    var myLng = parseFloat(tmp[1]);
    if (myLat >= -90 && myLat <= 90 && myLng >= -180 && myLng <= 180) return { lat: myLat, lng: myLng };else return undefined;
}
function strToSeconds(str) {
    if (str === undefined || str == null) return undefined;
    var tmp = str.split(':');
    var hours = parseInt(tmp[0], 10);
    var minutes = parseInt(tmp[1], 10);
    var seconds = 0;
    if (tmp[2]) seconds = parseInt(tmp[2], 10);
    if (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60 && seconds >= 0 && seconds < 60) return 3600 * hours + 60 * minutes + seconds;else return undefined;
}

function getCountedWays(fromPositionStr, toPositionStr, myStartTimeStr, my_dopTimeMinutes, my_speed, typesStr, oneWayOnly) {
    var startOptimalRoutePoint, finalOptimalRoutePoint, myStartTime, types, startInitializingMoment, params, res, findedOptimalWays;
    return regeneratorRuntime.async(function getCountedWays$(_context2) {
        while (1) {
            switch (_context2.prev = _context2.next) {
                case 0:
                    //console.log("Start counting...");

                    startOptimalRoutePoint = strToCoords(fromPositionStr);
                    finalOptimalRoutePoint = strToCoords(toPositionStr);
                    myStartTime = strToSeconds(myStartTimeStr);

                    if (!(startOptimalRoutePoint === undefined || finalOptimalRoutePoint === undefined || myStartTime === undefined)) {
                        _context2.next = 5;
                        break;
                    }

                    return _context2.abrupt('return', null);

                case 5:
                    types = null;

                    if (typesStr !== undefined) types = typesStr.split(',');
                    if (types === undefined || types == null) types = ["bus", "trolleybus"];

                    startInitializingMoment = Date.now();
                    params = {
                        startOptimalRoutePoint: startOptimalRoutePoint,
                        finalOptimalRoutePoint: finalOptimalRoutePoint,
                        startTime: myStartTime,
                        transportTypes: types,
                        goingSpeed: parseFloat(my_speed),
                        dopTimeMinutes: parseFloat(my_dopTimeMinutes),
                        oneWayOnly: oneWayOnly
                    };
                    _context2.next = 12;
                    return regeneratorRuntime.awrap(_dataProvider2.default.loadDataAndInitialize());

                case 12:
                    res = new _optimalRoutesCollection2.default(_dataProvider2.default.getAllStations(), params.startOptimalRoutePoint, params.finalOptimalRoutePoint, params.startTime, params.transportTypes, params.goingSpeed, params.dopTimeMinutes, params.oneWayOnly);
                    //console.log(res);

                    findedOptimalWays = res.getOptimalWays();
                    //console.log(findedOptimalWays);


                    //if(findedOptimalWays != null) console.log("Finded " + findedOptimalWays.length + " optimal routes. Time = " + (Date.now() - startInitializingMoment) + " ms.");

                    return _context2.abrupt('return', findedOptimalWays);

                case 15:
                case 'end':
                    return _context2.stop();
            }
        }
    }, null, this);
}

exports.default = AppServer;