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

var getJsonFromUrl = function () {
    var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4(strReq) {
        var response;
        return _regenerator2.default.wrap(function _callee4$(_context4) {
            while (1) {
                switch (_context4.prev = _context4.next) {
                    case 0:
                        _context4.next = 2;
                        return (0, _nodeFetch2.default)(strReq);

                    case 2:
                        response = _context4.sent;
                        _context4.next = 5;
                        return response.json();

                    case 5:
                        return _context4.abrupt('return', _context4.sent);

                    case 6:
                    case 'end':
                        return _context4.stop();
                }
            }
        }, _callee4, this);
    }));

    return function getJsonFromUrl(_x3) {
        return _ref4.apply(this, arguments);
    };
}();

/////////////////////////////////////////////

var _nodeFetch = require('node-fetch');

var _nodeFetch2 = _interopRequireDefault(_nodeFetch);

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//ToDo: create and use this:... import binaryFind from 'binarySearch/lib/binaryFind';

var GrodnoPositionsScraper = function () {
    function GrodnoPositionsScraper() {
        (0, _classCallCheck3.default)(this, GrodnoPositionsScraper);
    }

    (0, _createClass3.default)(GrodnoPositionsScraper, [{
        key: 'initialize',
        value: function () {
            var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(routesForAssotiating) {
                var test = function () {
                    var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
                        return _regenerator2.default.wrap(function _callee2$(_context2) {
                            while (1) {
                                switch (_context2.prev = _context2.next) {
                                    case 0:
                                        _context2.next = 2;
                                        return self.updatePositions();

                                    case 2:
                                        setTimeout(test, updatingInterval);

                                    case 3:
                                    case 'end':
                                        return _context2.stop();
                                }
                            }
                        }, _callee2, this);
                    }));

                    return function test() {
                        return _ref3.apply(this, arguments);
                    };
                }();

                var updatingInterval = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 5000;

                var grodnoRoutes, routeObj, i, n, routeType, routeNum, findedRoute, _i, currentRoute, _n, reqRoutesIdsPart, obj, self;

                return _regenerator2.default.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                this.associationsWithRoutes = [];

                                // Берем все известные провайдеру маршруты:
                                _context3.next = 3;
                                return getJsonFromUrl(_config2.default.apiGetRoutesUrl);

                            case 3:
                                grodnoRoutes = _context3.sent;
                                routeObj = grodnoRoutes[0], i = 0, n = grodnoRoutes.length;

                            case 5:
                                if (!(i < n)) {
                                    _context3.next = 30;
                                    break;
                                }

                                //console.log(routeObj);
                                routeType = null;

                                if (!(routeObj.type === "А")) {
                                    _context3.next = 11;
                                    break;
                                }

                                routeType = "bus";
                                _context3.next = 13;
                                break;

                            case 11:
                                console.log("Нераспознанный тип маршрута (" + routeObj.type + "):");
                                //console.log(routeObj);
                                return _context3.abrupt('continue', 27);

                            case 13:
                                routeNum = routeObj.num;
                                findedRoute = null;
                                _i = 0, currentRoute = routesForAssotiating[0], _n = routesForAssotiating.length;

                            case 16:
                                if (!(_i < _n)) {
                                    _context3.next = 23;
                                    break;
                                }

                                if (!(currentRoute.number == routeNum && currentRoute.type == routeType)) {
                                    _context3.next = 20;
                                    break;
                                }

                                findedRoute = currentRoute;
                                return _context3.abrupt('break', 23);

                            case 20:
                                currentRoute = routesForAssotiating[++_i];
                                _context3.next = 16;
                                break;

                            case 23:
                                if (!(findedRoute == null)) {
                                    _context3.next = 26;
                                    break;
                                }

                                console.log("Нераспознанный маршрут: " + routeNum);
                                //console.log(routeObj);
                                return _context3.abrupt('continue', 27);

                            case 26:

                                this.associationsWithRoutes[parseInt(routeObj.id)] = findedRoute;

                            case 27:
                                routeObj = grodnoRoutes[++i];
                                _context3.next = 5;
                                break;

                            case 30:

                                // Формируем URL запроса на получение местоположения транспорта:
                                reqRoutesIdsPart = "";
                                //console.log(this.associationsWithRoutes);

                                for (obj in this.associationsWithRoutes) {
                                    //for (let obj = this.associationsWithRoutes[0], i = 0, n = this.associationsWithRoutes.length; i < n; obj = this.associationsWithRoutes[++i]){
                                    reqRoutesIdsPart += obj + "-0,";
                                }
                                this.getPositionsUrl = _config2.default.apiGetPositionsUrlPart + reqRoutesIdsPart.slice(0, -1);
                                //console.log("URL: "+this.getPositionsUrl);
                                this.grodnoVehicles = [];

                                this.updatePositions = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
                                    var returnedVehicles, vehicle, currentVehicleRoute, _i2, _n2, currentVehicle;

                                    return _regenerator2.default.wrap(function _callee$(_context) {
                                        while (1) {
                                            switch (_context.prev = _context.next) {
                                                case 0:
                                                    _context.next = 2;
                                                    return getJsonFromUrl(this.getPositionsUrl);

                                                case 2:
                                                    returnedVehicles = _context.sent.anims;
                                                    vehicle = returnedVehicles[0], _i2 = 0, _n2 = returnedVehicles.length;

                                                case 4:
                                                    if (!(_i2 < _n2)) {
                                                        _context.next = 22;
                                                        break;
                                                    }

                                                    currentVehicle = this.grodnoVehicles[parseInt(vehicle.id)];

                                                    if (!(currentVehicle == null)) {
                                                        _context.next = 12;
                                                        break;
                                                    }

                                                    currentVehicleRoute = this.associationsWithRoutes[parseInt(vehicle.rid)];

                                                    if (!(currentVehicleRoute == null)) {
                                                        _context.next = 11;
                                                        break;
                                                    }

                                                    console.log("Не найдена связь с маршрутом: " + vehicle.rid);
                                                    return _context.abrupt('continue', 19);

                                                case 11:
                                                    currentVehicle = this.grodnoVehicles[parseInt(vehicle.id)] = {
                                                        route: currentVehicleRoute
                                                    };

                                                case 12:
                                                    currentVehicle.lat = vehicle.lat / 1000000;
                                                    currentVehicle.lng = vehicle.lon / 1000000;
                                                    currentVehicle.timestamp = vehicle.lasttime;
                                                    currentVehicle.localId = vehicle.id;
                                                    currentVehicle.speedInLastMoment = vehicle.speed;
                                                    currentVehicle.way = null;
                                                    currentVehicle.trip = null;

                                                    //console.log(currentVehicle);

                                                case 19:
                                                    vehicle = returnedVehicles[++_i2];
                                                    _context.next = 4;
                                                    break;

                                                case 22:
                                                case 'end':
                                                    return _context.stop();
                                            }
                                        }
                                    }, _callee, this);
                                }));

                                _context3.next = 37;
                                return this.updatePositions();

                            case 37:
                                console.log("Grodno-vehicles-provider was initialized.");

                                self = this;

                                setTimeout(test, updatingInterval);

                            case 40:
                            case 'end':
                                return _context3.stop();
                        }
                    }
                }, _callee3, this);
            }));

            function initialize(_x) {
                return _ref.apply(this, arguments);
            }

            return initialize;
        }()
    }, {
        key: 'getVehicles',
        value: function getVehicles() {
            var result = [];
            for (var key in this.grodnoVehicles) {
                result.push(this.grodnoVehicles[key]);
            }return result;
        }
    }]);
    return GrodnoPositionsScraper;
}();

/////////////////////////////////////////////

function binaryFind(array, predicateForArrayItem) {
    var i = 0,
        j = array.length,
        k = void 0,
        predicateResult = void 0,
        currentItem = void 0;

    while (i < j) {
        k = ~~((i + j) / 2);
        currentItem = array[k];
        predicateResult = predicateForArrayItem(currentItem, k, array);

        if (predicateResult === 0) return currentItem;else if (predicateResult === 1) j = k;else i = k + 1;
    }
    return null;
}

exports.default = GrodnoPositionsScraper;