'use strict';

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var WayPoint = require('./wayPoint');

var OptimalWay = function OptimalWay(optimalRoute) {
    (0, _classCallCheck3.default)(this, OptimalWay);

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