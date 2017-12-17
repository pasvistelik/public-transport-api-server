'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _mysql = require('mysql');

var _mysql2 = _interopRequireDefault(_mysql);

var _publicTransportDatabase = require('public-transport-database');

var _publicTransportDatabase2 = _interopRequireDefault(_publicTransportDatabase);

var _publicTransportInitializeData = require('public-transport-initialize-data');

var _publicTransportInitializeData2 = _interopRequireDefault(_publicTransportInitializeData);

var _publicTransportGpsPositionsCollector = require('public-transport-gps-positions-collector');

var _publicTransportGpsPositionsCollector2 = _interopRequireDefault(_publicTransportGpsPositionsCollector);

var _positionsLocalArchive = require('public-transport-gps-positions-collector/lib/positionsLocalArchive');

var _positionsLocalArchive2 = _interopRequireDefault(_positionsLocalArchive);

var _grodnoTransportGpsPositionsScraper = require('grodno-transport-gps-positions-scraper');

var _grodnoTransportGpsPositionsScraper2 = _interopRequireDefault(_grodnoTransportGpsPositionsScraper);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AppConfig = null;

var fetch = require('node-fetch');

var savingPositionsStarted = false;

var DataProvider = function () {
    function DataProvider() {
        _classCallCheck(this, DataProvider);
    }

    _createClass(DataProvider, null, [{
        key: 'useConfig',
        value: function useConfig(config) {
            AppConfig = config;
        }

        //static updatingFromServerIntervalMiliseconds = 5000;

        //static allVehiclesJSON = null;

    }, {
        key: 'getAllStations',
        value: function getAllStations() {
            return DataProvider.allStations;
        }
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
        key: 'getAllVehicles',
        value: function getAllVehicles() {
            return DataProvider.allVehicles;
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
        key: 'getAllVehiclesJSON',
        value: function getAllVehiclesJSON() {
            var result = [];
            for (var i = 0, n = DataProvider.allVehicles.length, currentVehicle = DataProvider.allVehicles[0]; i < n; currentVehicle = DataProvider.allVehicles[++i]) {
                result.push({
                    globalId: currentVehicle.globalId,
                    routeId: currentVehicle.route.hashcode,
                    lat: currentVehicle.lat,
                    lng: currentVehicle.lng,
                    timestamp: currentVehicle.timestamp,
                    speedInLastMoment: currentVehicle.speedInLastMoment
                    //wayId: currentVehicle.way,
                    //tripId: currentVehicle.trip
                });
            }
            return result; //DataProvider.allVehiclesJSON;
        }
    }, {
        key: 'loadDataAndInitialize',
        value: function loadDataAndInitialize() {
            return regeneratorRuntime.async(function loadDataAndInitialize$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            if (DataProvider.loadingStarted) {
                                _context.next = 14;
                                break;
                            }

                            DataProvider.loadingStarted = true;

                            _context.next = 4;
                            return regeneratorRuntime.awrap(_publicTransportDatabase2.default.useConnection({
                                host: AppConfig.databaseHost,
                                user: AppConfig.databaseUser,
                                password: AppConfig.databasePassword,
                                database: AppConfig.databaseName
                            }));

                        case 4:
                            _context.next = 6;
                            return regeneratorRuntime.awrap(DataProvider.loadDataOnly());

                        case 6:
                            if (!(DataProvider.allStationsLoaded && DataProvider.allRoutesLoaded && DataProvider.allTimetablesLoaded)) {
                                _context.next = 12;
                                break;
                            }

                            (0, _publicTransportInitializeData2.default)(DataProvider.allStations, DataProvider.allRoutes, DataProvider.allTimetables);

                            _publicTransportGpsPositionsCollector2.default.startCollect();
                            _context.next = 11;
                            return regeneratorRuntime.awrap(_publicTransportGpsPositionsCollector2.default.use(_grodnoTransportGpsPositionsScraper2.default, DataProvider.allRoutes));

                        case 11:
                            //todo: не allRoutes, а те, что в Гродно...

                            DataProvider.allVehicles = _publicTransportGpsPositionsCollector2.default.vehicles;

                        case 12:

                            savingPositionsStarted = true;
                            continueSavingPositionsToDatabase();

                        case 14:
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
                            return regeneratorRuntime.awrap(fetch(AppConfig.apiGetStationsUrl));

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
                            return regeneratorRuntime.awrap(fetch(AppConfig.apiGetRoutesUrl));

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
                            return regeneratorRuntime.awrap(fetch(AppConfig.apiGetTimetablesUrl));

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
DataProvider.allVehicles = null;
DataProvider.allTimetables = null;
DataProvider.loadingStarted = false;
DataProvider.allStationsLoaded = false;
DataProvider.allRoutesLoaded = false;
DataProvider.allTimetablesLoaded = false;
DataProvider.allStationsJSON = null;
DataProvider.allRoutesJSON = null;
DataProvider.allTimetablesJSON = null;
exports.default = DataProvider;


var positionsForSave = [];
function continueSavingPositionsToDatabase() {
    var tmpPositions;
    return regeneratorRuntime.async(function continueSavingPositionsToDatabase$(_context3) {
        while (1) {
            switch (_context3.prev = _context3.next) {
                case 0:
                    _context3.prev = 0;
                    tmpPositions = _positionsLocalArchive2.default.ejectAll();

                    if (tmpPositions != null) {
                        positionsForSave = positionsForSave.concat(tmpPositions);
                    }

                    if (!(positionsForSave.length !== 0)) {
                        _context3.next = 8;
                        break;
                    }

                    _context3.next = 6;
                    return regeneratorRuntime.awrap(_publicTransportDatabase2.default.pushPositionsInPositionsTable(tmpPositions));

                case 6:
                    console.log("Positions (" + tmpPositions.length + " points) saved to database.");
                    positionsForSave = [];

                case 8:
                    _context3.next = 13;
                    break;

                case 10:
                    _context3.prev = 10;
                    _context3.t0 = _context3['catch'](0);

                    console.log(_context3.t0);

                case 13:

                    setTimeout(continueSavingPositionsToDatabase, 10000);

                case 14:
                case 'end':
                    return _context3.stop();
            }
        }
    }, null, this, [[0, 10]]);
}