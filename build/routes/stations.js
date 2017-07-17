'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _dataProvider = require('../modules/public-transport-server-code/dataProvider');

var _dataProvider2 = _interopRequireDefault(_dataProvider);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function _callee(req, res, next) {
    return _regenerator2.default.async(function _callee$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    _context.next = 2;
                    return _regenerator2.default.awrap(_dataProvider2.default.loadDataAndInitialize());

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