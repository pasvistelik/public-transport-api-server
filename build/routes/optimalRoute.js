'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express2.default.Router();

var OptimalRoutesCollection = require('../modules/optimalRoutesCollection');
//import OptimalRoutesCollection from 'optimalRoutesCollection';


router.get('/', function (req, res, next) {

    function strToCoords(str) {
        if (str == undefined || str == null) return undefined;
        var tmp = str.split(',');
        var myLat = parseFloat(tmp[0]);
        var myLng = parseFloat(tmp[1]);
        if (myLat >= -90 && myLat <= 90 && myLng >= -180 && myLng <= 180) return { lat: myLat, lng: myLng };else return undefined;
    }
    function strToSeconds(str) {
        if (str == undefined || str == null) return undefined;
        var tmp = str.split(':');
        var hours = parseInt(tmp[0]);
        var minutes = parseInt(tmp[1]);
        if (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) return 3600 * hours + 60 * minutes;else return undefined;
    }

    var fromPosition = strToCoords(req.query.from);
    var toPosition = strToCoords(req.query.to);
    var myStartTime = strToSeconds(req.query.startTime);

    if (fromPosition == undefined || toPosition == undefined || myStartTime == undefined) res.json(null);else {
        var my_speed = parseFloat(req.query.goingSpeed);
        if (my_speed == undefined || my_speed == null || my_speed <= 1) my_speed = 5;
        var my_dopTimeMinutes = parseFloat(req.query.dopTimeMinutes);
        if (my_dopTimeMinutes == undefined || my_dopTimeMinutes == null || my_dopTimeMinutes < 0) my_dopTimeMinutes = 2;

        var types = null;
        if (req.query.transportTypes != undefined) types = req.query.transportTypes.split(',');
        if (types == undefined || types == null) types = ["bus", "trolleybus"];

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
        } else res.json(null);
    }
});

module.exports = router;