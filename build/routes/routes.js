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
					res.send(_dataProvider2.default.getAllRoutesJSON());

				case 3:
				case 'end':
					return _context.stop();
			}
		}
	}, null, this);
});

router.get('/migrate', function _callee2(req, res, next) {
	var tmpAllRoutes, result, i, n, item, companyId;
	return regeneratorRuntime.async(function _callee2$(_context2) {
		while (1) {
			switch (_context2.prev = _context2.next) {
				case 0:
					_context2.next = 2;
					return regeneratorRuntime.awrap(_dataProvider2.default.loadDataAndInitialize());

				case 2:
					tmpAllRoutes = _dataProvider2.default.getAllRoutes();
					result = [];


					for (i = 0, n = tmpAllRoutes.length, item = tmpAllRoutes[0]; i < n; item = tmpAllRoutes[++i]) {
						companyId = null;

						if (item.number != null && item.number !== "0") {
							if (item.type == "bus") companyId = 1;else if (item.type == "trolleybus") companyId = 2;
						}
						result.push({
							//route_id: ,
							type: item.type,
							number: item.number,
							name: item.from + " - " + item.to,
							transport_company_id: companyId,
							tmp_route_hashcode: item.hashcode
							//tmp_stations_codes: null//JSON.stringify(item.stationsCodes)
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

router.get('/ways/migrate', function _callee3(req, res, next) {
	var tmpAllRoutes, result, i, n, item;
	return regeneratorRuntime.async(function _callee3$(_context3) {
		while (1) {
			switch (_context3.prev = _context3.next) {
				case 0:
					_context3.next = 2;
					return regeneratorRuntime.awrap(_dataProvider2.default.loadDataAndInitialize());

				case 2:
					tmpAllRoutes = _dataProvider2.default.getAllRoutes();
					result = [];


					for (i = 0, n = tmpAllRoutes.length, item = tmpAllRoutes[0]; i < n; item = tmpAllRoutes[++i]) {
						result.push({
							//route_id: ,
							name: item.from + " - " + item.to,
							tmp_route_hashcode: item.hashcode
							//tmp_stations_codes: null//JSON.stringify(item.stationsCodes)
						});
						result.push({
							//route_id: ,
							name: item.to + " - " + item.from,
							tmp_route_hashcode: item.hashcode
							//tmp_stations_codes: null//JSON.stringify(item.stationsCodes)
						});
					}

					res.send(JSON.stringify(result));

				case 6:
				case 'end':
					return _context3.stop();
			}
		}
	}, null, this);
});

router.get('/relations/migrate', function _callee4(req, res, next) {
	var tmpAllRoutes, tmpAllTimetables, result, fragments, all_trips, free_arrive_id, free_trips_of_ways_relation_id, free_trip_id, i, k, n, currentRoute, t, j, m, st, obj, reqGetFreeWayId, request, request_begin, freeIndexInPositionsTable, addingCount, addingTripsOfWaysCount, _i, _n, currentWay, _j, _m, item, findingTimetableFunc, currentTimetable, _t, innerTabsCount, currentTab, _t2, _innerTabsCount, _currentTab, _k, currentDay, _k2, timesLength, currentTime, tpmIndex, y, prevTripId, _t3, _innerTabsCount2, _currentTab2, _k3, _timesLength, _currentTime, _tpmIndex, _y;

	return regeneratorRuntime.async(function _callee4$(_context4) {
		while (1) {
			switch (_context4.prev = _context4.next) {
				case 0:
					reqGetFreeWayId = function reqGetFreeWayId(routeHashcode) {
						return "SET @free_way_id=(SELECT `way_id` FROM `ways` WHERE `way_id` NOT IN (SELECT `way_id` FROM `ways_vs_stations_relations`) AND `route_id`=(SELECT `route_id` FROM `routes` WHERE `tmp_route_hashcode`=\"" + routeHashcode + "\" LIMIT 1) LIMIT 1); ";
					};

					_context4.next = 3;
					return regeneratorRuntime.awrap(_dataProvider2.default.loadDataAndInitialize());

				case 3:
					tmpAllRoutes = JSON.parse(_dataProvider2.default.getAllRoutesJSON());
					tmpAllTimetables = JSON.parse(_dataProvider2.default.getAllTimetablesJSON());
					result = [];
					fragments = [];
					all_trips = [];
					free_arrive_id = 0;
					free_trips_of_ways_relation_id = 0;
					free_trip_id = 0;
					_context4.prev = 11;
					i = 0, k = 0, n = tmpAllRoutes.length, currentRoute = tmpAllRoutes[0];

				case 13:
					if (!(i < n)) {
						_context4.next = 29;
						break;
					}

					if (!(currentRoute.stationsCodes == null)) {
						_context4.next = 16;
						break;
					}

					return _context4.abrupt('continue', 26);

				case 16:
					t = 0;

				case 17:
					if (!(t <= 1)) {
						_context4.next = 26;
						break;
					}

					if (!(currentRoute.stationsCodes[t].length == 0)) {
						_context4.next = 20;
						break;
					}

					return _context4.abrupt('continue', 23);

				case 20:
					result = [];
					//console.log("-- R = "+currentRoute.hashcode+", stations_count = "+currentRoute.stationsCodes[t].length);
					for (j = 0, m = currentRoute.stationsCodes[t].length, st = currentRoute.stationsCodes[t][0]; j < m; st = currentRoute.stationsCodes[t][++j]) {
						if (j > 0) {
							result[result.length - 1].next_relation_id = k;
						}
						obj = {
							stations_vs_ways_relation_id: k++,
							tmp_station_hashcode: st, //.hashcode,
							tmp_route_hashcode: currentRoute.hashcode,
							next_relation_id: null,
							previous_relation_id: j > 0 ? k - 2 : null
							//console.log(obj);
						};
						result.push(obj);
					}
					fragments.push(result);

				case 23:
					t++;
					_context4.next = 17;
					break;

				case 26:
					currentRoute = tmpAllRoutes[++i];
					_context4.next = 13;
					break;

				case 29:
					_context4.next = 34;
					break;

				case 31:
					_context4.prev = 31;
					_context4.t0 = _context4['catch'](11);

					console.log(_context4.t0);

				case 34:
					request = "";
					request_begin = "INSERT INTO `ways_vs_stations_relations`(`stations_vs_ways_relation_id`, `previous_relation_id`, `next_relation_id`, `way_id`, `station_id`) VALUES (";
					freeIndexInPositionsTable = 0;
					addingCount = 0;
					addingTripsOfWaysCount = 0;
					_i = 0, _n = fragments.length, currentWay = fragments[0];

				case 40:
					if (!(_i < _n)) {
						_context4.next = 76;
						break;
					}

					_j = 0, _m = currentWay.length, item = currentWay[0];

				case 42:
					if (!(_j < _m)) {
						_context4.next = 73;
						break;
					}

					if (_j == 0) {
						request += reqGetFreeWayId(item.tmp_route_hashcode);
					}
					request += request_begin + item.stations_vs_ways_relation_id + ", " + item.previous_relation_id + ", " + "NULL, " + "@free_way_id, " + "(SELECT `station_id` FROM `stations` WHERE `tmp_station_hashcode`=\"" + item.tmp_station_hashcode + "\" LIMIT 1)" + "); ";
					if (_j !== 0) {
						request += "UPDATE `ways_vs_stations_relations` SET `next_relation_id`=" + (item.stations_vs_ways_relation_id + freeIndexInPositionsTable) + " WHERE `stations_vs_ways_relation_id`=" + (item.previous_relation_id + freeIndexInPositionsTable) + " LIMIT 1; ";
					}

					findingTimetableFunc = getFindingTimetableFunc(item.tmp_station_hashcode, item.tmp_route_hashcode);
					currentTimetable = binaryFind(tmpAllTimetables, findingTimetableFunc);

					if (_j == 0) {
						//request += reqGetFreeWayId(item.tmp_route_hashcode);

						if (currentTimetable != null) {
							for (_t = 0, innerTabsCount = currentTimetable.table.length, currentTab = currentTimetable.table[0]; _t < innerTabsCount; currentTab = currentTimetable.table[++_t]) {
								addingCount += currentTab.times.length;
							}
							addingTripsOfWaysCount = currentTimetable.table.length;

							for (_t2 = 0, _innerTabsCount = currentTimetable.table.length, _currentTab = currentTimetable.table[0]; _t2 < _innerTabsCount; _currentTab = currentTimetable.table[++_t2]) {
								request += "INSERT INTO `trips_of_ways_relations`(`trips_of_ways_relation_id`, `way_id`) VALUES (" + (free_trips_of_ways_relation_id + _t2) + ",@free_way_id); ";

								for (_k = 0, currentDay = _currentTab.days[0]; _k < 7; currentDay = _currentTab.days[++_k]) {
									if (currentDay === 1) {
										request += "INSERT INTO `standart_days_of_trips`(`day_of_week`, `trips_of_ways_relation_id`) VALUES (" + _k + "," + (free_trips_of_ways_relation_id + _t2) + "); ";
									}
								}

								for (_k2 = 0, timesLength = _currentTab.times.length, currentTime = _currentTab.times[0]; _k2 < timesLength; currentTime = _currentTab.times[++_k2]) {
									tpmIndex = 0;

									for (y = 0; y < _t2; tpmIndex += currentTimetable.table[y].times.length, y++) {}
									tpmIndex += _k2;

									prevTripId = _k2 === 0 ? "NULL" : free_trip_id + tpmIndex - 1;

									request += "INSERT INTO `single_trips`(`trip_id`, `previous_trip_id`, `next_trip_id`, `trips_of_ways_relation_id`) VALUES (" + (free_trip_id + tpmIndex) + "," + prevTripId + ",NULL," + (free_trips_of_ways_relation_id + _t2) + "); ";
									all_trips[free_trip_id + tpmIndex] = true;
									if (_k2 > 0) {
										request += "UPDATE `single_trips` SET `next_trip_id`=" + (free_trip_id + tpmIndex) + " WHERE `trip_id`=" + prevTripId + " LIMIT 1; ";
									}
								}
							}
						}
					}

					if (!(currentTimetable != null && currentTimetable.type == 1 /*"1" означает движение по расписанию*/)) {
						_context4.next = 69;
						break;
					}

					if (currentTimetable.spetial.length != 0) console.log("We have a spetial table for station = " + item.tmp_station_hashcode + " and route = " + item.tmp_route_hashcode);
					_t3 = 0, _innerTabsCount2 = currentTimetable.table.length, _currentTab2 = currentTimetable.table[0];

				case 52:
					if (!(_t3 < _innerTabsCount2)) {
						_context4.next = 69;
						break;
					}

					_k3 = 0, _timesLength = _currentTab2.times.length, _currentTime = _currentTab2.times[0];

				case 54:
					if (!(_k3 < _timesLength)) {
						_context4.next = 66;
						break;
					}

					_tpmIndex = 0;

					for (_y = 0; _y < _t3; _tpmIndex += currentTimetable.table[_y].times.length, _y++) {}
					_tpmIndex += _k3;

					if (all_trips[free_trip_id + _tpmIndex]) {
						_context4.next = 61;
						break;
					}

					console.log("unknown id: " + (free_trip_id + _tpmIndex));
					return _context4.abrupt('continue', 63);

				case 61:

					request += "INSERT INTO `arrives`(`arrive_id`, `trip_id`, `stations_vs_ways_relation_id`, `arrive_time`) VALUES (" + free_arrive_id + "," + (free_trip_id + _tpmIndex) + "," + item.stations_vs_ways_relation_id + "," + _currentTime + "); ";

					free_arrive_id++;

				case 63:
					_currentTime = _currentTab2.times[++_k3];
					_context4.next = 54;
					break;

				case 66:
					_currentTab2 = currentTimetable.table[++_t3];
					_context4.next = 52;
					break;

				case 69:
					if (_j === _m - 1 && currentTimetable != null) {
						free_trips_of_ways_relation_id += addingTripsOfWaysCount; //currentTimetable.table.length;

						//for(let t = 0, innerTabsCount=currentTimetable.table.length, currentTab = currentTimetable.table[0]; t<innerTabsCount; currentTab = currentTimetable.table[++t]){
						free_trip_id += addingCount;
						//}
						//free_trip_id+=1;
					}

				case 70:
					item = currentWay[++_j];
					_context4.next = 42;
					break;

				case 73:
					currentWay = fragments[++_i];
					_context4.next = 40;
					break;

				case 76:

					request = request.slice(0, -1);
					//console.log(request);
					res.send(request);
					//res.send(JSON.stringify(fragments));

				case 78:
				case 'end':
					return _context4.stop();
			}
		}
	}, null, this, [[11, 31]]);
});

module.exports = router;

function binaryFind(array, predicateForArrayItem) {
	var i = 0,
	    j = array.length,
	    k = void 0,
	    predicateResult = void 0,
	    currentItem = void 0;

	while (i < j) {
		k = ~~((i + j) / 2);
		currentItem = array[k];
		predicateResult = predicateForArrayItem(currentItem, k, array);

		if (predicateResult === 0) return currentItem;else if (predicateResult === 1) j = k;else i = k + 1;
	}
	return null;
}
function getFindingTimetableFunc(stationCode, routeCode) {
	return function (element, index, array) {
		if (element.stationCode > stationCode) return 1;else if (element.stationCode === stationCode) {
			if (element.routeCode === routeCode) return 0;else if (element.routeCode > routeCode) return 1;
			return -1;
		}
		return -1;
	};
}

/*
CREATE TABLE `stations` (
	`station_id` INT(15) NOT NULL AUTO_INCREMENT,
	`area_id` INT(15),
	`lat` FLOAT NOT NULL,
	`lng` FLOAT NOT NULL,
	`name` VARCHAR(255) NOT NULL,
	`tmp_station_hashcode` varchar(15) UNIQUE,
	PRIMARY KEY (`station_id`)
);

CREATE TABLE `routes` (
	`route_id` INT(15) NOT NULL AUTO_INCREMENT,
	`type` varchar(25) NOT NULL,
	`number` varchar(10) NOT NULL,
	`name` varchar(256) NOT NULL,
	`transport_company_id` INT(15),
	`tmp_route_hashcode` varchar(15) UNIQUE,
	PRIMARY KEY (`route_id`)
);

CREATE TABLE `areas` (
	`area_id` INT(15) NOT NULL AUTO_INCREMENT,
	`name` varchar(256) NOT NULL,
	`type` varchar(64),
	`parent_area_id` INT(15),
	PRIMARY KEY (`area_id`)
);

CREATE TABLE `transport_companies` (
	`transport_company_id` INT(15) NOT NULL AUTO_INCREMENT,
	`name` varchar(256),
	`site` varchar(256),
	PRIMARY KEY (`transport_company_id`)
);

CREATE TABLE `vehicles` (
	`vehicle_id` INT(15) NOT NULL AUTO_INCREMENT,
	`trip_id` INT(15) NOT NULL,
	`last_lat` FLOAT NOT NULL,
	`last_lng` FLOAT NOT NULL,
	`last_timestamp` TIMESTAMP NOT NULL,
	PRIMARY KEY (`vehicle_id`)
);

CREATE TABLE `areas_vs_transport_companies` (
	`area_id` INT(15) NOT NULL,
	`transport_company_id` INT(15) NOT NULL
);

CREATE TABLE `tickets` (
	`ticket_id` INT(15) NOT NULL AUTO_INCREMENT,
	`description` VARCHAR(255),
	`currency_code` varchar(10) NOT NULL,
	`price` DECIMAL NOT NULL DEFAULT '0',
	`ticket_sample_image` blob,
	PRIMARY KEY (`ticket_id`)
);

CREATE TABLE `gps_positions_archive` (
	`position_id` INT(15) NOT NULL,
	`previous_position_id` INT(15),
	`next_position_id` INT(15),
	`lat` FLOAT NOT NULL,
	`lng` FLOAT NOT NULL,
	`vehicle_id` INT(15),
	`date` DATE NOT NULL,
	`day_of_week` INT(1) NOT NULL,
	`time_seconds` INT(6) NOT NULL,
	`route_id` INT(15),
	`way_id` INT(15),
	`trip_id` INT(15),
	PRIMARY KEY (`position_id`)
);

CREATE TABLE `single_trips` (
	`trip_id` INT(15) NOT NULL,
	`previous_trip_id` INT(15),
	`next_trip_id` INT(15),
	`trips_of_ways_relation_id` INT(15) NOT NULL,
	PRIMARY KEY (`trip_id`)
);

CREATE TABLE `tickets_vs_transport_companies` (
	`ticket_id` INT(15) NOT NULL,
	`transport_company_id` INT(15) NOT NULL
);

CREATE TABLE `arriving_to_stations_facts` (
	`station_id` INT(15) NOT NULL,
	`position_before_arrive` INT(15) NOT NULL,
	`position_after_arrive` INT(15) NOT NULL,
	`real_arrival_time` INT(10) NOT NULL,
	`expected_arrive` INT(15) NOT NULL,
	`trip_id` INT(15) NOT NULL
);

CREATE TABLE `ways` (
	`way_id` INT(15) NOT NULL AUTO_INCREMENT,
	`route_id` INT(15) NOT NULL,
	`name` varchar(256) NOT NULL,
	PRIMARY KEY (`way_id`)
);

CREATE TABLE `standart_days_of_trips` (
	`day_of_week` INT(1) NOT NULL,
	`trips_of_ways_relation_id` INT(15) NOT NULL
);

CREATE TABLE `dates_of_spetial_trips` (
	`date` DATE NOT NULL,
	`trips_of_ways_relation_id` INT(15) NOT NULL
);

CREATE TABLE `ways_vs_stations_relations` (
	`stations_vs_ways_relation_id` INT(15) NOT NULL,
	`previous_relation_id` INT(15),
	`next_relation_id` INT(15),
	`way_id` INT(15) NOT NULL,
	`station_id` INT(15) NOT NULL,
	PRIMARY KEY (`stations_vs_ways_relation_id`)
);

CREATE TABLE `arrives` (
	`arrive_id` INT(15) NOT NULL AUTO_INCREMENT,
	`trip_id` INT(15) NOT NULL,
	`stations_vs_ways_relation_id` INT(15) NOT NULL,
	`arrive_time` INT(6) NOT NULL,
	PRIMARY KEY (`arrive_id`)
);

CREATE TABLE `trips_of_ways_relations` (
	`trips_of_ways_relation_id` INT(15) NOT NULL,
	`way_id` INT(15) NOT NULL,
	PRIMARY KEY (`trips_of_ways_relation_id`)
);

CREATE TABLE `going_distances_between_nearest_stations` (
	`station_1_id` INT(15) NOT NULL,
	`station_2_id` INT(15) NOT NULL,
	`distance` INT(15) NOT NULL
);

ALTER TABLE `stations` ADD CONSTRAINT `stations_fk0` FOREIGN KEY (`area_id`) REFERENCES `areas`(`area_id`);

ALTER TABLE `routes` ADD CONSTRAINT `routes_fk0` FOREIGN KEY (`transport_company_id`) REFERENCES `transport_companies`(`transport_company_id`);

ALTER TABLE `areas` ADD CONSTRAINT `areas_fk0` FOREIGN KEY (`parent_area_id`) REFERENCES `areas`(`area_id`);

ALTER TABLE `vehicles` ADD CONSTRAINT `vehicles_fk0` FOREIGN KEY (`trip_id`) REFERENCES `single_trips`(`trip_id`);

ALTER TABLE `areas_vs_transport_companies` ADD CONSTRAINT `areas_vs_transport_companies_fk0` FOREIGN KEY (`area_id`) REFERENCES `areas`(`area_id`);

ALTER TABLE `areas_vs_transport_companies` ADD CONSTRAINT `areas_vs_transport_companies_fk1` FOREIGN KEY (`transport_company_id`) REFERENCES `transport_companies`(`transport_company_id`);

ALTER TABLE `gps_positions_archive` ADD CONSTRAINT `gps_positions_archive_fk0` FOREIGN KEY (`previous_position_id`) REFERENCES `gps_positions_archive`(`position_id`);

ALTER TABLE `gps_positions_archive` ADD CONSTRAINT `gps_positions_archive_fk1` FOREIGN KEY (`next_position_id`) REFERENCES `gps_positions_archive`(`position_id`);

ALTER TABLE `gps_positions_archive` ADD CONSTRAINT `gps_positions_archive_fk2` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles`(`vehicle_id`);

ALTER TABLE `gps_positions_archive` ADD CONSTRAINT `gps_positions_archive_fk3` FOREIGN KEY (`route_id`) REFERENCES `routes`(`route_id`);

ALTER TABLE `gps_positions_archive` ADD CONSTRAINT `gps_positions_archive_fk4` FOREIGN KEY (`way_id`) REFERENCES `ways`(`way_id`);

ALTER TABLE `gps_positions_archive` ADD CONSTRAINT `gps_positions_archive_fk5` FOREIGN KEY (`trip_id`) REFERENCES `single_trips`(`trip_id`);

ALTER TABLE `single_trips` ADD CONSTRAINT `single_trips_fk0` FOREIGN KEY (`previous_trip_id`) REFERENCES `single_trips`(`trip_id`);

ALTER TABLE `single_trips` ADD CONSTRAINT `single_trips_fk1` FOREIGN KEY (`next_trip_id`) REFERENCES `single_trips`(`trip_id`);

ALTER TABLE `single_trips` ADD CONSTRAINT `single_trips_fk2` FOREIGN KEY (`trips_of_ways_relation_id`) REFERENCES `trips_of_ways_relations`(`trips_of_ways_relation_id`);

ALTER TABLE `tickets_vs_transport_companies` ADD CONSTRAINT `tickets_vs_transport_companies_fk0` FOREIGN KEY (`ticket_id`) REFERENCES `tickets`(`ticket_id`);

ALTER TABLE `tickets_vs_transport_companies` ADD CONSTRAINT `tickets_vs_transport_companies_fk1` FOREIGN KEY (`transport_company_id`) REFERENCES `transport_companies`(`transport_company_id`);

ALTER TABLE `arriving_to_stations_facts` ADD CONSTRAINT `arriving_to_stations_facts_fk0` FOREIGN KEY (`station_id`) REFERENCES `stations`(`station_id`);

ALTER TABLE `arriving_to_stations_facts` ADD CONSTRAINT `arriving_to_stations_facts_fk1` FOREIGN KEY (`position_before_arrive`) REFERENCES `gps_positions_archive`(`position_id`);

ALTER TABLE `arriving_to_stations_facts` ADD CONSTRAINT `arriving_to_stations_facts_fk2` FOREIGN KEY (`position_after_arrive`) REFERENCES `gps_positions_archive`(`position_id`);

ALTER TABLE `arriving_to_stations_facts` ADD CONSTRAINT `arriving_to_stations_facts_fk3` FOREIGN KEY (`expected_arrive`) REFERENCES `arrives`(`arrive_id`);

ALTER TABLE `arriving_to_stations_facts` ADD CONSTRAINT `arriving_to_stations_facts_fk4` FOREIGN KEY (`trip_id`) REFERENCES `single_trips`(`trip_id`);

ALTER TABLE `ways` ADD CONSTRAINT `ways_fk0` FOREIGN KEY (`route_id`) REFERENCES `routes`(`route_id`);

ALTER TABLE `standart_days_of_trips` ADD CONSTRAINT `standart_days_of_trips_fk0` FOREIGN KEY (`trips_of_ways_relation_id`) REFERENCES `trips_of_ways_relations`(`trips_of_ways_relation_id`);

ALTER TABLE `dates_of_spetial_trips` ADD CONSTRAINT `dates_of_spetial_trips_fk0` FOREIGN KEY (`trips_of_ways_relation_id`) REFERENCES `trips_of_ways_relations`(`trips_of_ways_relation_id`);

ALTER TABLE `ways_vs_stations_relations` ADD CONSTRAINT `ways_vs_stations_relations_fk0` FOREIGN KEY (`previous_relation_id`) REFERENCES `ways_vs_stations_relations`(`stations_vs_ways_relation_id`);

ALTER TABLE `ways_vs_stations_relations` ADD CONSTRAINT `ways_vs_stations_relations_fk1` FOREIGN KEY (`next_relation_id`) REFERENCES `ways_vs_stations_relations`(`stations_vs_ways_relation_id`);

ALTER TABLE `ways_vs_stations_relations` ADD CONSTRAINT `ways_vs_stations_relations_fk2` FOREIGN KEY (`way_id`) REFERENCES `ways`(`way_id`);

ALTER TABLE `ways_vs_stations_relations` ADD CONSTRAINT `ways_vs_stations_relations_fk3` FOREIGN KEY (`station_id`) REFERENCES `stations`(`station_id`);

ALTER TABLE `arrives` ADD CONSTRAINT `arrives_fk0` FOREIGN KEY (`trip_id`) REFERENCES `single_trips`(`trip_id`);

ALTER TABLE `arrives` ADD CONSTRAINT `arrives_fk1` FOREIGN KEY (`stations_vs_ways_relation_id`) REFERENCES `ways_vs_stations_relations`(`stations_vs_ways_relation_id`);

ALTER TABLE `trips_of_ways_relations` ADD CONSTRAINT `trips_of_ways_relations_fk0` FOREIGN KEY (`way_id`) REFERENCES `ways`(`way_id`);

ALTER TABLE `going_distances_between_nearest_stations` ADD CONSTRAINT `going_distances_between_nearest_stations_fk0` FOREIGN KEY (`station_1_id`) REFERENCES `stations`(`station_id`);

ALTER TABLE `going_distances_between_nearest_stations` ADD CONSTRAINT `going_distances_between_nearest_stations_fk1` FOREIGN KEY (`station_2_id`) REFERENCES `stations`(`station_id`);

*/