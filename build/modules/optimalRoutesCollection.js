'use strict';

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var IgnoringFragments = require('./ignoringFragments');
var OptimalRoute = require('./optimalRoute');
var OptimalWay = require('./optimalWay');

var OptimalRoutesCollection = function (_Array) {
    (0, _inherits3.default)(OptimalRoutesCollection, _Array);

    function OptimalRoutesCollection(nowPos, needPos, time, types, speed, dopTimeMinutes) {
        (0, _classCallCheck3.default)(this, OptimalRoutesCollection);

        var _this = (0, _possibleConstructorReturn3.default)(this, (OptimalRoutesCollection.__proto__ || Object.getPrototypeOf(OptimalRoutesCollection)).call(this));

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

    (0, _createClass3.default)(OptimalRoutesCollection, [{
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