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
        var ok, response;
        return _regenerator2.default.wrap(function _callee4$(_context4) {
            while (1) {
                switch (_context4.prev = _context4.next) {
                    case 0:
                        ok = false;
                        response = null;

                    case 2:
                        if (ok) {
                            _context4.next = 17;
                            break;
                        }

                        _context4.prev = 3;
                        _context4.next = 6;
                        return (0, _nodeFetch2.default)(strReq);

                    case 6:
                        response = _context4.sent;

                        ok = true;
                        _context4.next = 15;
                        break;

                    case 10:
                        _context4.prev = 10;
                        _context4.t0 = _context4['catch'](3);

                        console.log(_context4.t0.message);
                        _context4.next = 15;
                        return new Promise(function (resolve) {
                            return setTimeout(resolve, 500);
                        });

                    case 15:
                        _context4.next = 2;
                        break;

                    case 17:
                        _context4.next = 19;
                        return response.json();

                    case 19:
                        return _context4.abrupt('return', _context4.sent);

                    case 20:
                    case 'end':
                        return _context4.stop();
                }
            }
        }, _callee4, this, [[3, 10]]);
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

function findDate(string) {
    var dateTime = /(\d{1,2})\.(\d{1,2})\.(\d{4}) (\d{1,2}):(\d{1,2}):(\d{1,2})/;
    var match = dateTime.exec(string);
    return new Date(Number(match[2]) + "." + Number(match[1]) + "." + Number(match[3]) + " " + Number(match[4]) + ":" + Number(match[5]) + ":" + Number(match[6]) + " GMT");
}

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
                                this.readyToEjectVehicles = [];

                                // Берем все известные провайдеру маршруты:
                                _context3.next = 4;
                                return getJsonFromUrl(_config2.default.apiGetRoutesUrl);

                            case 4:
                                grodnoRoutes = _context3.sent;
                                routeObj = grodnoRoutes[0], i = 0, n = grodnoRoutes.length;

                            case 6:
                                if (!(i < n)) {
                                    _context3.next = 31;
                                    break;
                                }

                                //console.log(routeObj);
                                routeType = null;

                                if (!(routeObj.type === "А")) {
                                    _context3.next = 12;
                                    break;
                                }

                                routeType = "bus";
                                _context3.next = 14;
                                break;

                            case 12:
                                console.log("Нераспознанный тип маршрута (" + routeObj.type + "):");
                                //console.log(routeObj);
                                return _context3.abrupt('continue', 28);

                            case 14:
                                routeNum = routeObj.num;
                                findedRoute = null;
                                _i = 0, currentRoute = routesForAssotiating[0], _n = routesForAssotiating.length;

                            case 17:
                                if (!(_i < _n)) {
                                    _context3.next = 24;
                                    break;
                                }

                                if (!(currentRoute.number == routeNum && currentRoute.type == routeType)) {
                                    _context3.next = 21;
                                    break;
                                }

                                findedRoute = currentRoute;
                                return _context3.abrupt('break', 24);

                            case 21:
                                currentRoute = routesForAssotiating[++_i];
                                _context3.next = 17;
                                break;

                            case 24:
                                if (!(findedRoute == null)) {
                                    _context3.next = 27;
                                    break;
                                }

                                console.log("Нераспознанный маршрут: " + routeNum);
                                //console.log(routeObj);
                                return _context3.abrupt('continue', 28);

                            case 27:

                                this.associationsWithRoutes[parseInt(routeObj.id)] = findedRoute;

                            case 28:
                                routeObj = grodnoRoutes[++i];
                                _context3.next = 6;
                                break;

                            case 31:

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
                                    var returnedVehicles, vehicle, currentVehicleRoute, _i2, _n2, currentVehicle, needCreateVehicle, oldLat, oldLng, oldDateStr;

                                    return _regenerator2.default.wrap(function _callee$(_context) {
                                        while (1) {
                                            switch (_context.prev = _context.next) {
                                                case 0:
                                                    _context.next = 2;
                                                    return getJsonFromUrl(this.getPositionsUrl);

                                                case 2:
                                                    returnedVehicles = _context.sent.anims;

                                                    //console.log(returnedVehicles);
                                                    for (vehicle = returnedVehicles[0], _i2 = 0, _n2 = returnedVehicles.length; _i2 < _n2; vehicle = returnedVehicles[++_i2]) {
                                                        currentVehicle = this.grodnoVehicles[parseInt(vehicle.id)];
                                                        needCreateVehicle = currentVehicle == null;

                                                        if (needCreateVehicle) {
                                                            currentVehicle = this.grodnoVehicles[parseInt(vehicle.id)] = {};
                                                        }

                                                        currentVehicleRoute = this.associationsWithRoutes[parseInt(vehicle.rid)];
                                                        if (currentVehicleRoute == null && needCreateVehicle) {
                                                            console.log("Не найдена связь с маршрутом: " + vehicle.rid);
                                                            //continue;
                                                        }
                                                        currentVehicle.route = currentVehicleRoute;

                                                        oldLat = null, oldLng = null, oldDateStr = null;

                                                        if (!needCreateVehicle) {
                                                            oldLat = currentVehicle.lat;
                                                            oldLng = currentVehicle.lng;
                                                            oldDateStr = currentVehicle.date.toString();
                                                        }

                                                        currentVehicle.lat = vehicle.lat / 1000000;
                                                        currentVehicle.lng = vehicle.lon / 1000000;
                                                        //console.log(vehicle.lasttime);
                                                        //currentVehicle.timestamp = (new Date(vehicle.lasttime+" GMT").toLocaleString('ru-RU', { timeZone: 'Europe/Minsk' })).toString();
                                                        currentVehicle.date = findDate(vehicle.lasttime);
                                                        currentVehicle.localId = vehicle.id;
                                                        currentVehicle.speedInLastMoment = vehicle.speed;
                                                        currentVehicle.way = null;
                                                        currentVehicle.trip = null;

                                                        if (currentVehicle.lat !== oldLat || currentVehicle.lng !== oldLng || currentVehicle.date.toString() !== oldDateStr) {
                                                            this.readyToEjectVehicles[parseInt(vehicle.id)] = true;
                                                        }

                                                        //console.log(currentVehicle);
                                                    }

                                                case 4:
                                                case 'end':
                                                    return _context.stop();
                                            }
                                        }
                                    }, _callee, this);
                                }));

                                _context3.next = 38;
                                return this.updatePositions();

                            case 38:
                                console.log("Grodno-vehicles-provider was initialized.");

                                self = this;

                                setTimeout(test, updatingInterval);

                            case 41:
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
        key: 'ejectUpdatedVehicles',
        value: function ejectUpdatedVehicles() {
            var result = [];
            for (var key in this.grodnoVehicles) {
                var currentVehicle = this.grodnoVehicles[key];
                if (this.readyToEjectVehicles[parseInt(currentVehicle.localId)]) {
                    result.push(currentVehicle);
                    this.readyToEjectVehicles[parseInt(currentVehicle.localId)] = false;
                }
            }
            return result;
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