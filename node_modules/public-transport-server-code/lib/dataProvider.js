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

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

var _publicTransportInitializeData = require('public-transport-initialize-data');

var _publicTransportInitializeData2 = _interopRequireDefault(_publicTransportInitializeData);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var fetch = require('node-fetch');

var DataProvider = function () {
    function DataProvider() {
        (0, _classCallCheck3.default)(this, DataProvider);
    }

    (0, _createClass3.default)(DataProvider, null, [{
        key: 'getAllStations',
        value: function getAllStations() {
            return DataProvider.allStations;
        }

        //static updatingFromServerInterval = 5000;

    }, {
        key: 'getAllRoutes',
        value: function getAllRoutes() {
            return DataProvider.allRoutes;
        }
    }, {
        key: 'getAllTimetables',
        value: function getAllTimetables() {
            return DataProvider.allTimetables;
        }
    }, {
        key: 'getAllStationsJSON',
        value: function getAllStationsJSON() {
            return DataProvider.allStationsJSON;
        }
    }, {
        key: 'getAllRoutesJSON',
        value: function getAllRoutesJSON() {
            return DataProvider.allRoutesJSON;
        }
    }, {
        key: 'getAllTimetablesJSON',
        value: function getAllTimetablesJSON() {
            return DataProvider.allTimetablesJSON;
        }
    }, {
        key: 'loadDataAndInitialize',
        value: function () {
            var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                if (DataProvider.loadingStarted) {
                                    _context.next = 5;
                                    break;
                                }

                                DataProvider.loadingStarted = true;

                                _context.next = 4;
                                return DataProvider.loadDataOnly();

                            case 4:

                                if (DataProvider.allStationsLoaded && DataProvider.allRoutesLoaded && DataProvider.allTimetablesLoaded) {
                                    (0, _publicTransportInitializeData2.default)(DataProvider.allStations, DataProvider.allRoutes, DataProvider.allTimetables);
                                }

                            case 5:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            function loadDataAndInitialize() {
                return _ref.apply(this, arguments);
            }

            return loadDataAndInitialize;
        }()
    }, {
        key: 'loadDataOnly',
        value: function () {
            var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2() {
                var response, _response, _response2;

                return _regenerator2.default.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                if (DataProvider.allStationsLoaded) {
                                    _context2.next = 11;
                                    break;
                                }

                                console.log("Downloading stations from server...");

                                _context2.next = 4;
                                return fetch(_config2.default.apiGetStationsUrl);

                            case 4:
                                response = _context2.sent;
                                _context2.next = 7;
                                return response.text();

                            case 7:
                                DataProvider.allStationsJSON = _context2.sent;

                                DataProvider.allStations = JSON.parse(DataProvider.allStationsJSON);

                                DataProvider.allStationsLoaded = true;
                                console.log("Stations loaded from server.");

                            case 11:
                                if (DataProvider.allRoutesLoaded) {
                                    _context2.next = 22;
                                    break;
                                }

                                console.log("Downloading routes from server...");

                                _context2.next = 15;
                                return fetch(_config2.default.apiGetRoutesUrl);

                            case 15:
                                _response = _context2.sent;
                                _context2.next = 18;
                                return _response.text();

                            case 18:
                                DataProvider.allRoutesJSON = _context2.sent;

                                DataProvider.allRoutes = JSON.parse(DataProvider.allRoutesJSON);

                                DataProvider.allRoutesLoaded = true;
                                console.log("Routes loaded from server.");

                            case 22:
                                if (DataProvider.allTimetablesLoaded) {
                                    _context2.next = 33;
                                    break;
                                }

                                console.log("Downloading timetables from server...");

                                _context2.next = 26;
                                return fetch(_config2.default.apiGetTimetablesUrl);

                            case 26:
                                _response2 = _context2.sent;
                                _context2.next = 29;
                                return _response2.text();

                            case 29:
                                DataProvider.allTimetablesJSON = _context2.sent;

                                DataProvider.allTimetables = JSON.parse(DataProvider.allTimetablesJSON);

                                DataProvider.allTimetablesLoaded = true;
                                console.log("Timetables loaded from server.");

                            case 33:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, this);
            }));

            function loadDataOnly() {
                return _ref2.apply(this, arguments);
            }

            return loadDataOnly;
        }()
    }]);
    return DataProvider;
}();

DataProvider.allStations = null;
DataProvider.allRoutes = null;
DataProvider.allTimetables = null;
DataProvider.loadingStarted = false;
DataProvider.allStationsLoaded = false;
DataProvider.allRoutesLoaded = false;
DataProvider.allTimetablesLoaded = false;
DataProvider.allStationsJSON = null;
DataProvider.allRoutesJSON = null;
DataProvider.allTimetablesJSON = null;
exports.default = DataProvider;