'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var IgnoringFragments = require('./ignoringFragments');
var OptimalRoute = require('./optimalRoute');
var OptimalWay = require('./optimalWay');

var OptimalRoutesCollection = function (_Array) {
    _inherits(OptimalRoutesCollection, _Array);

    function OptimalRoutesCollection(nowPos, needPos, time, types, speed, dopTimeMinutes) {
        _classCallCheck(this, OptimalRoutesCollection);

        var _this = _possibleConstructorReturn(this, (OptimalRoutesCollection.__proto__ || Object.getPrototypeOf(OptimalRoutesCollection)).call(this));

        _this.push(new OptimalRoute(nowPos, needPos, time, types, speed, dopTimeMinutes));

        var ignoringRoutes = new Array();

        var ignoringFragments = new IgnoringFragments();

        for (var selectedOptimalRoute = _this[0]; selectedOptimalRoute != null; selectedOptimalRoute.setVisited(), selectedOptimalRoute = _this.selectOptimalRouteWithMinimalMark()) {
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

                if (tmpOptimalRoute.totalTimeSeconds <= _this[0].totalTimeSeconds / ddd) {
                    var tmpJSON = JSON.stringify(tmpOptimalRoute.points);
                    var ok = false;
                    for (var j = 0, m = _this.length, opt = _this[0]; j < m; opt = _this[++j]) {
                        if (JSON.stringify(opt.points) == tmpJSON) {
                            ok = true;
                            break;
                        }
                    }
                    if (ok) continue;
                    _this.push(tmpOptimalRoute);
                }
            }
        }
        return _this;
    }

    _createClass(OptimalRoutesCollection, [{
        key: 'getOptimalWays',
        value: function getOptimalWays() {
            var result = new Array();
            for (var i = 0, n = this.length, r = this[0]; i < n; r = this[++i]) {
                result.push(new OptimalWay(r));
            }
            return result;
        }
    }, {
        key: 'selectOptimalRouteWithMinimalMark',
        value: function selectOptimalRouteWithMinimalMark() {
            var p = null;
            for (var i = 0, n = this.length, t = this[0]; i < n; t = this[++i]) {
                if (!t.isVisited) {
                    p = t;
                    for (t = this[++i]; i < n; t = this[++i]) {
                        if (!t.isVisited && t.totalTimeSeconds < p.totalTimeSeconds) {
                            p = t;
                        }
                    }
                    return p;
                }
            }
            return null;
        }
    }]);

    return OptimalRoutesCollection;
}(Array);

module.exports = OptimalRoutesCollection;