'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var getCountedWays = function () {
    var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(fromPositionStr, toPositionStr, myStartTimeStr, my_dopTimeMinutes, my_speed, typesStr) {
        var startOptimalRoutePoint, finalOptimalRoutePoint, myStartTime, types, startInitializingMoment, params, res, findedOptimalWays;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        console.log("Start counting...");

                        startOptimalRoutePoint = strToCoords(fromPositionStr);
                        finalOptimalRoutePoint = strToCoords(toPositionStr);
                        myStartTime = strToSeconds(myStartTimeStr);

                        if (!(startOptimalRoutePoint === undefined || finalOptimalRoutePoint === undefined || myStartTime === undefined)) {
                            _context2.next = 6;
                            break;
                        }

                        return _context2.abrupt('return', null);

                    case 6:
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
                            dopTimeMinutes: parseFloat(my_dopTimeMinutes)
                        };
                        _context2.next = 13;
                        return _dataProvider2.default.loadDataAndInitialize();

                    case 13:
                        res = new _optimalRoutesCollection2.default(_dataProvider2.default.getAllStations(), params.startOptimalRoutePoint, params.finalOptimalRoutePoint, params.startTime, params.transportTypes, params.goingSpeed, params.dopTimeMinutes);

                        console.log(res);
                        findedOptimalWays = res.getOptimalWays();

                        console.log(findedOptimalWays);

                        console.log("Finded " + findedOptimalWays.length + " optimal routes. Time = " + (Date.now() - startInitializingMoment) + " ms.");

                        return _context2.abrupt('return', findedOptimalWays);

                    case 19:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, this);
    }));

    return function getCountedWays(_x7, _x8, _x9, _x10, _x11, _x12) {
        return _ref2.apply(this, arguments);
    };
}();

var _optimalRoutesCollection = require('public-transport-find-optimal-ways/lib/optimalRoutesCollection');

var _optimalRoutesCollection2 = _interopRequireDefault(_optimalRoutesCollection);

var _dataProvider = require('./dataProvider');

var _dataProvider2 = _interopRequireDefault(_dataProvider);

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var AppServer = function () {
    function AppServer() {
        (0, _classCallCheck3.default)(this, AppServer);
    }

    (0, _createClass3.default)(AppServer, null, [{
        key: 'findWays',

        // Find optimal ways between two points. The start time, reserved time, going speed and transport types are known.
        value: function () {
            var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(fromPositionStr, toPositionStr, myStartTimeStr, my_dopTimeMinutes, my_speed, typesStr) {
                var findedOptimalWays, minimalTimeSeconds, minimalGoingTimeSeconds, minimalTransportChangingCount, i;
                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                findedOptimalWays = null;
                                minimalTimeSeconds = 0;
                                minimalGoingTimeSeconds = 0;
                                minimalTransportChangingCount = 0;
                                _context.prev = 4;
                                _context.next = 7;
                                return getCountedWays(fromPositionStr, toPositionStr, myStartTimeStr, my_dopTimeMinutes, my_speed, typesStr);

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
                }, _callee, this, [[4,, 8, 12]]);
            }));

            function findWays(_x, _x2, _x3, _x4, _x5, _x6) {
                return _ref.apply(this, arguments);
            }

            return findWays;
        }()
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
    if (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) return 3600 * hours + 60 * minutes;else return undefined;
}

exports.default = AppServer;