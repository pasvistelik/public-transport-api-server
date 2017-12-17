"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var executeQuery = function () {
  var _ref5 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5(query) {
    var connection, promise;
    return _regenerator2.default.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            connection = null;
            _context5.prev = 1;

            connection = _mysql2.default.createConnection(connConfig);
            connection.connect();
            promise = new Promise(function (resolve, reject) {
              connection.query(query, function (error, results, fields) {
                //console.log(results);
                if (results) {
                  resolve(results);
                  return results;
                }
                if (error) reject(error);
              });
            });
            _context5.next = 7;
            return promise;

          case 7:
            return _context5.abrupt("return", _context5.sent);

          case 10:
            _context5.prev = 10;
            _context5.t0 = _context5["catch"](1);

            console.log(_context5.t0.message);
            return _context5.abrupt("return", null);

          case 14:
            _context5.prev = 14;

            if (connection != null) connection.end();
            return _context5.finish(14);

          case 17:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5, this, [[1, 10, 14, 17]]);
  }));

  return function executeQuery(_x3) {
    return _ref5.apply(this, arguments);
  };
}();

var _mysql = require("mysql");

var _mysql2 = _interopRequireDefault(_mysql);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var connConfig = null;


var freeIndexInPositionsTable = 0;

var TransportDatabase = function () {
  (0, _createClass3.default)(TransportDatabase, null, [{
    key: "useConnection",
    value: function () {
      var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(conn) {
        var index;
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                connConfig = conn;
                connConfig.multipleStatements = true;

                _context.next = 4;
                return TransportDatabase.getNextFreeIndexInPositionsTable();

              case 4:
                index = _context.sent;

                freeIndexInPositionsTable = index;
                console.log("freeIndexInPositionsTable = " + freeIndexInPositionsTable);

              case 7:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function useConnection(_x) {
        return _ref.apply(this, arguments);
      }

      return useConnection;
    }()
  }]);

  function TransportDatabase() {
    (0, _classCallCheck3.default)(this, TransportDatabase);

    throw new Error("TransportDatabase is a static class!");
  }

  (0, _createClass3.default)(TransportDatabase, null, [{
    key: "getPositionsArchive",
    value: function () {
      var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
        return _regenerator2.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return executeQuery("SELECT * from `gps_positions_archive`");

              case 2:
                return _context2.abrupt("return", _context2.sent);

              case 3:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function getPositionsArchive() {
        return _ref2.apply(this, arguments);
      }

      return getPositionsArchive;
    }()
  }, {
    key: "getNextFreeIndexInPositionsTable",
    value: function () {
      var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3() {
        var results;
        return _regenerator2.default.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.next = 2;
                return executeQuery("SELECT (SELECT MAX(`position_id`) FROM `gps_positions_archive`) AS solution");

              case 2:
                results = _context3.sent;

                console.log(results[0]);
                console.log(results[0].solution);
                return _context3.abrupt("return", results[0].solution == null ? 0 : results[0].solution + 1);

              case 6:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function getNextFreeIndexInPositionsTable() {
        return _ref3.apply(this, arguments);
      }

      return getNextFreeIndexInPositionsTable;
    }()
  }, {
    key: "pushPositionsInPositionsTable",
    value: function () {
      var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4(positions) {
        var request, request_begin, i, n, currentItem, results;
        return _regenerator2.default.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                if (!(positions == null || positions.length === 0)) {
                  _context4.next = 2;
                  break;
                }

                return _context4.abrupt("return");

              case 2:
                request = "";
                request_begin = "INSERT INTO gps_positions_archive(`position_id`, `previous_position_id`, `next_position_id`, `lat`, `lng`, `vehicle_id`, `date`, `day_of_week`, `time_seconds`, `route_id`, `way_id`, `trip_id`) VALUES";


                for (i = 0, n = positions.length, currentItem = positions[0]; i < n; currentItem = positions[++i]) {
                  request += request_begin + " (" + (currentItem.positionId + freeIndexInPositionsTable) + ", " + (currentItem.previousPositionId == null ? "NULL" : currentItem.previousPositionId + freeIndexInPositionsTable) + ", " + "NULL, " //(currentItem.nextPositionId == null ? "null" : (currentItem.nextPositionId + freeIndexInPositionsTable)) + ", "
                  + currentItem.lat + ", " + currentItem.lng + ", " + (currentItem.vehicleId == null ? "NULL" : currentItem.vehicleId) + ", " + "\"" + currentItem.dateDDMMYY + "\", " + currentItem.dayOfWeek + ", " + currentItem.timeSeconds + ", " + (currentItem.routeCode /*Id*/ == null ? "NULL" : "(SELECT `route_id` FROM `routes` WHERE `tmp_route_hashcode`=\"" + currentItem.routeCode /*Id*/ + "\" LIMIT 1)") + ", " + (currentItem.wayId == null ? "NULL" : currentItem.wayId) + ", " + (currentItem.tripId == null ? "NULL" : currentItem.tripId) + "); ";

                  if (currentItem.previousPositionId != null) {
                    request += "UPDATE `gps_positions_archive` SET `next_position_id`=" + (currentItem.positionId + freeIndexInPositionsTable) + " WHERE `position_id`=" + (currentItem.previousPositionId + freeIndexInPositionsTable) + " LIMIT 1; ";
                  }
                }
                request = request.slice(0, -1);
                //console.log("\n\nrequest:");
                //console.log(request);
                //console.log("\n\n");

                _context4.next = 8;
                return executeQuery(request);

              case 8:
                results = _context4.sent;

                if (!(results == null)) {
                  _context4.next = 11;
                  break;
                }

                throw new Error();

              case 11:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function pushPositionsInPositionsTable(_x2) {
        return _ref4.apply(this, arguments);
      }

      return pushPositionsInPositionsTable;
    }()
  }]);
  return TransportDatabase;
}();

exports.default = TransportDatabase;