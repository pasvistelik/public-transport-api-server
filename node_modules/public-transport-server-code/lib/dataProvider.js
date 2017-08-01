'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

var _publicTransportInitializeData = require('public-transport-initialize-data');

var _publicTransportInitializeData2 = _interopRequireDefault(_publicTransportInitializeData);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var fetch = require('node-fetch');

var DataProvider = function () {
    function DataProvider() {
        _classCallCheck(this, DataProvider);
    }

    _createClass(DataProvider, null, [{
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
        value: function loadDataAndInitialize() {
            return regeneratorRuntime.async(function loadDataAndInitialize$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            if (DataProvider.loadingStarted) {
                                _context.next = 5;
                                break;
                            }

                            DataProvider.loadingStarted = true;

                            _context.next = 4;
                            return regeneratorRuntime.awrap(DataProvider.loadDataOnly());

                        case 4:

                            if (DataProvider.allStationsLoaded && DataProvider.allRoutesLoaded && DataProvider.allTimetablesLoaded) {
                                (0, _publicTransportInitializeData2.default)(DataProvider.allStations, DataProvider.allRoutes, DataProvider.allTimetables);
                            }

                        case 5:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, null, this);
        }
    }, {
        key: 'loadDataOnly',
        value: function loadDataOnly() {
            var response, _response, _response2;

            return regeneratorRuntime.async(function loadDataOnly$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            if (DataProvider.allStationsLoaded) {
                                _context2.next = 11;
                                break;
                            }

                            console.log("Downloading stations from server...");

                            _context2.next = 4;
                            return regeneratorRuntime.awrap(fetch(_config2.default.apiGetStationsUrl));

                        case 4:
                            response = _context2.sent;
                            _context2.next = 7;
                            return regeneratorRuntime.awrap(response.text());

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
                            return regeneratorRuntime.awrap(fetch(_config2.default.apiGetRoutesUrl));

                        case 15:
                            _response = _context2.sent;
                            _context2.next = 18;
                            return regeneratorRuntime.awrap(_response.text());

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
                            return regeneratorRuntime.awrap(fetch(_config2.default.apiGetTimetablesUrl));

                        case 26:
                            _response2 = _context2.sent;
                            _context2.next = 29;
                            return regeneratorRuntime.awrap(_response2.text());

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
            }, null, this);
        }
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