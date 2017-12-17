'use strict';

var _dataProvider = require('public-transport-server-code/lib/dataProvider');

var _dataProvider2 = _interopRequireDefault(_dataProvider);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function _callee(req, res, next) {
    return regeneratorRuntime.async(function _callee$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    _context.next = 2;
                    return regeneratorRuntime.awrap(_dataProvider2.default.loadDataAndInitialize());

                case 2:
                    res.send(_dataProvider2.default.getAllStationsJSON());

                case 3:
                case 'end':
                    return _context.stop();
            }
        }
    }, null, this);
});

router.get('/migrate', function _callee2(req, res, next) {
    var tmpAllStations, result, i, n, item;
    return regeneratorRuntime.async(function _callee2$(_context2) {
        while (1) {
            switch (_context2.prev = _context2.next) {
                case 0:
                    _context2.next = 2;
                    return regeneratorRuntime.awrap(_dataProvider2.default.loadDataAndInitialize());

                case 2:
                    tmpAllStations = _dataProvider2.default.getAllStations();
                    result = [];


                    for (i = 0, n = tmpAllStations.length, item = tmpAllStations[0]; i < n; item = tmpAllStations[++i]) {
                        result.push({
                            lat: item.coords.lat,
                            lng: item.coords.lng,
                            name: item.name,
                            tmp_station_hashcode: item.hashcode
                        });
                    }

                    res.send(JSON.stringify(result));

                case 6:
                case 'end':
                    return _context2.stop();
            }
        }
    }, null, this);
});

module.exports = router;