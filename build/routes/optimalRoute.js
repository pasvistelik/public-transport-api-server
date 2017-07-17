'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _dataProvider = require('../modules/public-transport-server-code/dataProvider');

var _dataProvider2 = _interopRequireDefault(_dataProvider);

var _server = require('../modules/public-transport-server-code/server');

var _server2 = _interopRequireDefault(_server);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express2.default.Router();

router.get('/', function _callee(req, res, next) {
        var strToCoords, strToSeconds, fromPosition, toPosition, myStartTime, my_speed, my_dopTimeMinutes, types, startInitializingMoment, tmpMyDate, fromPositionStr, toPositionStr, typesStr, i, n, hour, minute, myStartTimeStr, findedOptimalWays;
        return _regenerator2.default.async(function _callee$(_context) {
                while (1) {
                        switch (_context.prev = _context.next) {
                                case 0:
                                        strToSeconds = function strToSeconds(str) {
                                                if (str == undefined || str == null) return undefined;
                                                var tmp = str.split(':');
                                                var hours = parseInt(tmp[0]);
                                                var minutes = parseInt(tmp[1]);
                                                if (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) return 3600 * hours + 60 * minutes;else return undefined;
                                        };

                                        strToCoords = function strToCoords(str) {
                                                if (str == undefined || str == null) return undefined;
                                                var tmp = str.split(',');
                                                var myLat = parseFloat(tmp[0]);
                                                var myLng = parseFloat(tmp[1]);
                                                if (myLat >= -90 && myLat <= 90 && myLng >= -180 && myLng <= 180) return { lat: myLat, lng: myLng };else return undefined;
                                        };

                                        _context.next = 4;
                                        return _regenerator2.default.awrap(_dataProvider2.default.loadDataAndInitialize());

                                case 4:
                                        fromPosition = strToCoords(req.query.from);
                                        toPosition = strToCoords(req.query.to);
                                        myStartTime = strToSeconds(req.query.startTime);

                                        if (!(fromPosition == undefined || toPosition == undefined || myStartTime == undefined)) {
                                                _context.next = 11;
                                                break;
                                        }

                                        res.json(null);
                                        _context.next = 32;
                                        break;

                                case 11:
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


                                        _context.next = 29;
                                        return _regenerator2.default.awrap(_server2.default.findWays(fromPositionStr, toPositionStr, myStartTimeStr, my_dopTimeMinutes, my_speed, typesStr));

                                case 29:
                                        findedOptimalWays = _context.sent;


                                        console.log("Finded " + findedOptimalWays.length + " optimal routes. Time = " + (Date.now() - startInitializingMoment) + " ms.");

                                        res.json(findedOptimalWays);
                                        //}
                                        //else res.json(null);

                                case 32:
                                case 'end':
                                        return _context.stop();
                        }
                }
        }, null, this);
});

module.exports = router;