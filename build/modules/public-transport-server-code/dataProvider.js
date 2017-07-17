'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

var _publicTransportInitializeData = require('public-transport-initialize-data');

var _publicTransportInitializeData2 = _interopRequireDefault(_publicTransportInitializeData);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var fetch = require('node-fetch');


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Load data.
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var allStations = null;
var allRoutes = null;
var allTimetables = null;

//var updatingFromServerInterval = 5000;

var loadingStarted = false;

var allStationsLoaded = false,
    allRoutesLoaded = false,
    allTimetablesLoaded = false;
var allStationsJSON = null,
    allRoutesJSON = null,
    allTimetablesJSON = null;

function _loadDataOnly() {
    var response, _response, _response2;

    return _regenerator2.default.async(function loadDataOnly$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    if (allStationsLoaded) {
                        _context.next = 11;
                        break;
                    }

                    console.log("Downloading stations from server...");

                    _context.next = 4;
                    return _regenerator2.default.awrap(fetch(_config2.default.apiGetStationsUrl));

                case 4:
                    response = _context.sent;
                    _context.next = 7;
                    return _regenerator2.default.awrap(response.text());

                case 7:
                    allStationsJSON = _context.sent;

                    allStations = JSON.parse(allStationsJSON);

                    allStationsLoaded = true;
                    console.log("Stations loaded from server.");

                case 11:
                    if (allRoutesLoaded) {
                        _context.next = 22;
                        break;
                    }

                    console.log("Downloading routes from server...");

                    _context.next = 15;
                    return _regenerator2.default.awrap(fetch(_config2.default.apiGetRoutesUrl));

                case 15:
                    _response = _context.sent;
                    _context.next = 18;
                    return _regenerator2.default.awrap(_response.text());

                case 18:
                    allRoutesJSON = _context.sent;

                    allRoutes = JSON.parse(allRoutesJSON);

                    allRoutesLoaded = true;
                    console.log("Routes loaded from server.");

                case 22:
                    if (allTimetablesLoaded) {
                        _context.next = 33;
                        break;
                    }

                    console.log("Downloading timetables from server...");

                    _context.next = 26;
                    return _regenerator2.default.awrap(fetch(_config2.default.apiGetTimetablesUrl));

                case 26:
                    _response2 = _context.sent;
                    _context.next = 29;
                    return _regenerator2.default.awrap(_response2.text());

                case 29:
                    allTimetablesJSON = _context.sent;

                    allTimetables = JSON.parse(allTimetablesJSON);

                    allTimetablesLoaded = true;
                    console.log("Timetables loaded from server.");

                case 33:
                case 'end':
                    return _context.stop();
            }
        }
    }, null, this);
}

function loadData() {
    return _regenerator2.default.async(function loadData$(_context2) {
        while (1) {
            switch (_context2.prev = _context2.next) {
                case 0:
                    if (loadingStarted) {
                        _context2.next = 5;
                        break;
                    }

                    loadingStarted = true;

                    _context2.next = 4;
                    return _regenerator2.default.awrap(_loadDataOnly());

                case 4:

                    if (allStationsLoaded && allRoutesLoaded && allTimetablesLoaded) {
                        (0, _publicTransportInitializeData2.default)(allStations, allRoutes, allTimetables);
                    }

                case 5:
                case 'end':
                    return _context2.stop();
            }
        }
    }, null, this);
}

//loadData();

var DataProvider = function () {
    function DataProvider() {
        (0, _classCallCheck3.default)(this, DataProvider);
    }

    (0, _createClass3.default)(DataProvider, null, [{
        key: 'getAllStations',
        value: function getAllStations() {
            return allStations;
        }
    }, {
        key: 'getAllRoutes',
        value: function getAllRoutes() {
            return allRoutes;
        }
    }, {
        key: 'getAllTimetables',
        value: function getAllTimetables() {
            return allTimetables;
        }
    }, {
        key: 'getAllStationsJSON',
        value: function getAllStationsJSON() {
            return allStationsJSON;
        }
    }, {
        key: 'getAllRoutesJSON',
        value: function getAllRoutesJSON() {
            return allRoutesJSON;
        }
    }, {
        key: 'getAllTimetablesJSON',
        value: function getAllTimetablesJSON() {
            return allTimetablesJSON;
        }
    }, {
        key: 'loadDataAndInitialize',
        value: function loadDataAndInitialize() {
            return _regenerator2.default.async(function loadDataAndInitialize$(_context3) {
                while (1) {
                    switch (_context3.prev = _context3.next) {
                        case 0:
                            _context3.next = 2;
                            return _regenerator2.default.awrap(loadData());

                        case 2:
                        case 'end':
                            return _context3.stop();
                    }
                }
            }, null, this);
        }
    }, {
        key: 'loadDataOnly',
        value: function loadDataOnly() {
            return _regenerator2.default.async(function loadDataOnly$(_context4) {
                while (1) {
                    switch (_context4.prev = _context4.next) {
                        case 0:
                            _context4.next = 2;
                            return _regenerator2.default.awrap(_loadDataOnly());

                        case 2:
                        case 'end':
                            return _context4.stop();
                    }
                }
            }, null, this);
        }
    }]);
    return DataProvider;
}();

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// End load data.
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

exports.default = DataProvider;