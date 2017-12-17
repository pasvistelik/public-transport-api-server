"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var archive = [];
var posIndex = 0;

var Position = function Position(vehicle) {
    (0, _classCallCheck3.default)(this, Position);


    this.previousPosition = vehicle.lastPositionObj;
    this.previousPositionId = vehicle.lastPositionId == null ? null : vehicle.lastPositionId;

    this.positionId = posIndex++;

    this.nextPosition = null;
    this.nextPositionId = null;

    this.lat = vehicle.lat;
    this.lng = vehicle.lng;
    //this.timestamp = vehicle.timestamp;

    var tmpDate = vehicle.date;

    this.dateDDMMYY = tmpDate.toLocaleDateString(); //example: "01.01.2017"
    this.dayOfWeek = tmpDate.getDay(); // 0 -- 6
    this.timeSeconds = tmpDate.getSeconds() + 60 * tmpDate.getMinutes() + 3600 * tmpDate.getHours(); //time in seconds from day begin

    this.routeId = vehicle.route != null ? vehicle.route.routeId : null;
    this.routeCode = vehicle.route != null ? vehicle.route.hashcode : null;
    this.wayId = vehicle.way != null ? vehicle.way.wayId : null;
    this.tripId = vehicle.trip != null ? vehicle.trip.tripId : null;

    if (vehicle.lastPositionObj != null) {
        vehicle.lastPositionObj.nextPosition = this;
        vehicle.lastPositionObj.nextPositionId = this.positionId;
        vehicle.lastPositionObj.previousPosition = null;
    }
    vehicle.lastPositionObj = this;
    vehicle.lastPositionId = this.positionId;
};

var PositionsLocalArchive = function () {
    function PositionsLocalArchive() {
        (0, _classCallCheck3.default)(this, PositionsLocalArchive);

        throw new Error("PositionsLocalArchive is a static class!");
    }

    (0, _createClass3.default)(PositionsLocalArchive, null, [{
        key: "getLatestPositions",
        value: function getLatestPositions() {
            throw new Error("Not implemented!");
        }
    }, {
        key: "push",
        value: function push(vehicle) {
            archive.push(new Position(vehicle));
        }
    }, {
        key: "ejectAll",
        value: function ejectAll() {
            var result = archive;
            archive = [];
            return result;
        }
    }]);
    return PositionsLocalArchive;
}();

exports.default = PositionsLocalArchive;