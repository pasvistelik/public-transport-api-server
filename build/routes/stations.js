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

module.exports = router;