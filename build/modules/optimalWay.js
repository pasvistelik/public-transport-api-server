'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var WayPoint = require('./wayPoint');

var OptimalWay = function OptimalWay(optimalRoute) {
    _classCallCheck(this, OptimalWay);

    this.totalTimeSeconds = optimalRoute.totalTimeSeconds;
    this.totalGoingTimeSeconds = optimalRoute.totalGoingTime;
    this.totalTransportChangingCount = optimalRoute.totalTransportChangingCount;
    this.points = new Array();
    var optRoutePoints = optimalRoute.myPoints;

    for (var tmpP = optimalRoute.myPoints.finalPoint; tmpP != null; tmpP = tmpP.previousPoint) {
        this.points.push(new WayPoint(tmpP.totalTimeSeconds, tmpP.station, tmpP.fromWhichRoute, tmpP.coords));
    }
    this.points.reverse();
};

module.exports = OptimalWay;