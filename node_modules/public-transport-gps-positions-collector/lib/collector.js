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

var _positionsLocalArchive = require('./positionsLocalArchive');

var _positionsLocalArchive2 = _interopRequireDefault(_positionsLocalArchive);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var collectingStarted = false;

function continuePositionsUpdating() {
    if (!collectingStarted) return;
    for (var i = 0, n = PositionsCollector.scrapers.length, currentScraper = PositionsCollector.scrapers[0]; i < n; currentScraper = PositionsCollector.scrapers[++i]) {
        var vehicles = currentScraper.ejectUpdatedVehicles();
        for (var j = 0, m = vehicles.length, currentVehicle = vehicles[0]; j < m; currentVehicle = vehicles[++j]) {
            if (currentVehicle.globalId == null) {
                var index = PositionsCollector.vehicles.length;
                currentVehicle.globalId = index;
                PositionsCollector.vehicles[index] = currentVehicle;
            }
            _positionsLocalArchive2.default.push(currentVehicle);
        }
    }
    setTimeout(continuePositionsUpdating, _config2.default.updatingInterval);
}

var PositionsCollector = function () {
    function PositionsCollector() {
        (0, _classCallCheck3.default)(this, PositionsCollector);

        throw new Error("PositionsCollector is a static class!");
    }

    (0, _createClass3.default)(PositionsCollector, null, [{
        key: 'use',
        value: function () {
            var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(scraperClass, routes) {
                var scraper;
                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                scraper = new scraperClass();
                                _context.next = 3;
                                return scraper.initialize(routes, _config2.default.updatingInterval);

                            case 3:

                                PositionsCollector.scrapers.push(scraper);

                            case 4:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            function use(_x, _x2) {
                return _ref.apply(this, arguments);
            }

            return use;
        }()
    }, {
        key: 'startCollect',
        value: function startCollect() {
            if (collectingStarted) return;
            collectingStarted = true;
            continuePositionsUpdating();
        }
    }]);
    return PositionsCollector;
}();

PositionsCollector.scrapers = [];
PositionsCollector.vehicles = [];
exports.default = PositionsCollector;