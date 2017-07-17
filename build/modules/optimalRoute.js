'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Points = require('./points');
var distance = require('./geoCoords').distance;
var IgnoringFragments = require('./ignoringFragments');

function getStationsAround(coords, radius) {
        var result = new Array();
        for (var i = 0, n = global.allStations.length, s = global.allStations[0]; i < n; s = global.allStations[++i]) {
                if (s != null && distance(s.coords, coords) < radius) result.push(s);
        }
        return result;
}

var OptimalRoute = function () {
        function OptimalRoute(nowPos, needPos, time, types, goingSpeed, dopTimeMinutes, ignoringRoutesAdd, ignoringList) {
                _classCallCheck(this, OptimalRoute);

                if (ignoringRoutesAdd != undefined && ignoringRoutesAdd != null) this.ignoringRoutes = ignoringRoutesAdd;else this.ignoringRoutes = new Array();

                this.points = new Array();

                this.needPos = needPos;
                this.nowPos = nowPos;
                this.goingSpeed = goingSpeed;
                this.time = time;
                var reservedTimeSeconds = 60 * dopTimeMinutes;

                this.types = types;

                var myIgnoringFragments = null;
                if (ignoringList != null) myIgnoringFragments = new IgnoringFragments(ignoringList);else myIgnoringFragments = new IgnoringFragments();

                var myPoints = new Points(nowPos, needPos);
                // Получим "начальный" список станций:
                var stationsList = getStationsAround(myPoints.startPoint.coords, distance(myPoints.startPoint.coords, myPoints.finalPoint.coords));
                myPoints.fillStartData(stationsList, goingSpeed, reservedTimeSeconds, myIgnoringFragments);

                // Находим кратчайшие пути до всех вершин:
                myPoints.countShortWay(this.ignoringRoutes, myIgnoringFragments, time, types, goingSpeed, reservedTimeSeconds);

                var tmpP = myPoints.finalPoint;
                this.points.push(tmpP.toString()); ////
                while (tmpP.previousPoint != null) {
                        tmpP = tmpP.previousPoint; //
                        this.points.push(tmpP.toString());
                        if (tmpP.previousPoint == null && tmpP.coords != myPoints.startPoint.coords) throw new Exception("Где-то удалилась часть маршрута...");
                }

                this.totalTimeSeconds = myPoints.finalPoint.totalTimeSeconds;
                this.totalGoingTime = myPoints.finalPoint.getTotalGoingTime();
                this.totalTransportChangingCount = myPoints.finalPoint.getTotalTransportChangingCount();

                this.myPoints = myPoints;
                this.myIgnoringFragments = myIgnoringFragments;

                this.isVisited = false;
        }

        _createClass(OptimalRoute, [{
                key: 'setVisited',
                value: function setVisited() {
                        this.isVisited = true;
                }
        }]);

        return OptimalRoute;
}();

module.exports = OptimalRoute;