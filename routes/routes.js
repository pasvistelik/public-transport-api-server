var express = require('express');
var router = express.Router();

import DataProvider from 'public-transport-server-code/lib/dataProvider';

/* GET users listing. */
router.get('/', async function(req, res, next) {
    await DataProvider.loadDataAndInitialize();
    res.send(DataProvider.getAllRoutesJSON());
});

router.get('/migrate', async function(req, res, next) {
    await DataProvider.loadDataAndInitialize();
    let tmpAllRoutes = DataProvider.getAllRoutes();

    let result = [];

    for(let i=0, n=tmpAllRoutes.length, item=tmpAllRoutes[0]; i<n; item=tmpAllRoutes[++i]){
        let companyId = null;
        if(item.number != null && item.number !== "0"){
            if(item.type == "bus") companyId = 1;
            else if(item.type == "trolleybus") companyId = 2;
        }
        result.push({
            //route_id: ,
            type: item.type,
            number: item.number,
            name: item.from + " - " + item.to,
            transport_company_id: companyId,
            tmp_route_hashcode: item.hashcode,
            //tmp_stations_codes: null//JSON.stringify(item.stationsCodes)
        });
    }

    res.send(JSON.stringify(result));
});

router.get('/ways/migrate', async function(req, res, next) {
    await DataProvider.loadDataAndInitialize();
    let tmpAllRoutes = DataProvider.getAllRoutes();

    let result = [];

    for(let i=0, n=tmpAllRoutes.length, item=tmpAllRoutes[0]; i<n; item=tmpAllRoutes[++i]){
		result.push({
			//route_id: ,
			name: item.from + " - " + item.to,
			tmp_route_hashcode: item.hashcode,
			//tmp_stations_codes: null//JSON.stringify(item.stationsCodes)
		});
		result.push({
			//route_id: ,
			name: item.to + " - " + item.from,
			tmp_route_hashcode: item.hashcode,
			//tmp_stations_codes: null//JSON.stringify(item.stationsCodes)
		});
    }

    res.send(JSON.stringify(result));
});

router.get('/relations/migrate', async function(req, res, next) {
    await DataProvider.loadDataAndInitialize();
	let tmpAllRoutes = JSON.parse(DataProvider.getAllRoutesJSON());
	
	let tmpAllTimetables = JSON.parse(DataProvider.getAllTimetablesJSON());

	let result = [];
	let fragments = [];

	let all_trips=[];
	let free_arrive_id = 0;
	let free_trips_of_ways_relation_id = 0;
	let free_trip_id = 0;

	try{
		for(let i=0, k=0, n=tmpAllRoutes.length, currentRoute=tmpAllRoutes[0]; i<n; currentRoute=tmpAllRoutes[++i]){
			if(currentRoute.stationsCodes == null) continue;
			for(let t = 0; t<=1; t++){
				if(currentRoute.stationsCodes[t].length == 0) continue;
				result = [];
				//console.log("-- R = "+currentRoute.hashcode+", stations_count = "+currentRoute.stationsCodes[t].length);
				for(let j=0, m=currentRoute.stationsCodes[t].length, st=currentRoute.stationsCodes[t][0]; j<m; st=currentRoute.stationsCodes[t][++j]){
					if(j > 0){
						result[result.length - 1].next_relation_id = k;
					}
					let obj = {
						stations_vs_ways_relation_id: k++,	
						tmp_station_hashcode: st,//.hashcode,
						tmp_route_hashcode: currentRoute.hashcode,
						next_relation_id: null,
						previous_relation_id: ((j>0) ? k-2 : null),
					}
					//console.log(obj);
					result.push(obj);
				}
				fragments.push(result);
			}
		}
	}
	catch(e){
		console.log(e);
	}

	function reqGetFreeWayId(routeHashcode){
		return "SET @free_way_id=(SELECT `way_id` FROM `ways` WHERE `way_id` NOT IN (SELECT `way_id` FROM `ways_vs_stations_relations`) AND `route_id`=(SELECT `route_id` FROM `routes` WHERE `tmp_route_hashcode`=\""+routeHashcode+"\" LIMIT 1) LIMIT 1); ";
	}
	let request = "";
	let request_begin = "INSERT INTO `ways_vs_stations_relations`(`stations_vs_ways_relation_id`, `previous_relation_id`, `next_relation_id`, `way_id`, `station_id`) VALUES (";

	let freeIndexInPositionsTable = 0;

	let addingCount = 0;
	let addingTripsOfWaysCount = 0;

	for(let i=0, n=fragments.length, currentWay=fragments[0]; i<n; currentWay=fragments[++i]){
		//console.log("R = "+currentWay[0].tmp_route_hashcode+", stations count = "+currentWay.length)
		for(let j=0, m=currentWay.length, item=currentWay[0]; j<m; item=currentWay[++j]){
			
			if(j == 0){
				request += reqGetFreeWayId(item.tmp_route_hashcode);
			}
			request += request_begin
			+ item.stations_vs_ways_relation_id+ ", "
			+ item.previous_relation_id + ", "
			+ "NULL, "
			+ "@free_way_id, "
			+ "(SELECT `station_id` FROM `stations` WHERE `tmp_station_hashcode`=\""+item.tmp_station_hashcode+"\" LIMIT 1)"
			+ "); ";
			if(j !== 0){
				request += "UPDATE `ways_vs_stations_relations` SET `next_relation_id`="+(item.stations_vs_ways_relation_id + freeIndexInPositionsTable)+" WHERE `stations_vs_ways_relation_id`="+(item.previous_relation_id + freeIndexInPositionsTable)+" LIMIT 1; ";
			}

			

			let findingTimetableFunc = getFindingTimetableFunc(item.tmp_station_hashcode, item.tmp_route_hashcode);
			let currentTimetable = binaryFind(tmpAllTimetables, findingTimetableFunc);
			if(j == 0){
				//request += reqGetFreeWayId(item.tmp_route_hashcode);

				if(currentTimetable != null){
					for(let t = 0, innerTabsCount=currentTimetable.table.length, currentTab = currentTimetable.table[0]; t<innerTabsCount; currentTab = currentTimetable.table[++t]){
						addingCount += currentTab.times.length;
					}
					addingTripsOfWaysCount = currentTimetable.table.length;


					for(let t = 0, innerTabsCount=currentTimetable.table.length, currentTab = currentTimetable.table[0]; t<innerTabsCount; currentTab = currentTimetable.table[++t]){
						request += "INSERT INTO `trips_of_ways_relations`(`trips_of_ways_relation_id`, `way_id`) VALUES ("+(free_trips_of_ways_relation_id+t)+",@free_way_id); ";

						for(let k=0, currentDay = currentTab.days[0]; k<7; currentDay = currentTab.days[++k]){
							if(currentDay === 1){
								request += "INSERT INTO `standart_days_of_trips`(`day_of_week`, `trips_of_ways_relation_id`) VALUES ("+k+","+(free_trips_of_ways_relation_id+t)+"); ";
							}
						}

						for(let k=0, timesLength = currentTab.times.length, currentTime = currentTab.times[0]; k<timesLength; currentTime = currentTab.times[++k]){
							let tpmIndex = 0;
							for (let y = 0; y < t; tpmIndex += currentTimetable.table[y].times.length, y++);
							tpmIndex += k;
	
							let prevTripId = (k === 0) ? "NULL" : (free_trip_id + tpmIndex - 1);
							request += "INSERT INTO `single_trips`(`trip_id`, `previous_trip_id`, `next_trip_id`, `trips_of_ways_relation_id`) VALUES ("+(free_trip_id+tpmIndex)+","+prevTripId+",NULL,"+(free_trips_of_ways_relation_id+t)+"); ";
							all_trips[free_trip_id+tpmIndex] = true;
							if (k > 0){
								request += "UPDATE `single_trips` SET `next_trip_id`="+(free_trip_id+tpmIndex)+" WHERE `trip_id`="+prevTripId+" LIMIT 1; ";
							}
						}
					}
				}
			}
			if(currentTimetable != null && currentTimetable.type == 1/*"1" означает движение по расписанию*/){
				if(currentTimetable.spetial.length != 0) console.log("We have a spetial table for station = "+item.tmp_station_hashcode+" and route = "+item.tmp_route_hashcode);
				for(let t = 0, innerTabsCount=currentTimetable.table.length, currentTab = currentTimetable.table[0]; t<innerTabsCount; currentTab = currentTimetable.table[++t]){
					
					for(let k=0, timesLength = currentTab.times.length, currentTime = currentTab.times[0]; k<timesLength; currentTime = currentTab.times[++k]){
						let tpmIndex = 0;
						for (let y = 0; y < t; tpmIndex += currentTimetable.table[y].times.length, y++);
						tpmIndex += k;

						if(!all_trips[free_trip_id+tpmIndex]){
							console.log("unknown id: "+(free_trip_id+tpmIndex));
							continue;
						}

						request += "INSERT INTO `arrives`(`arrive_id`, `trip_id`, `stations_vs_ways_relation_id`, `arrive_time`) VALUES ("+free_arrive_id+","+(free_trip_id+tpmIndex)+","+item.stations_vs_ways_relation_id+","+currentTime+"); ";

						free_arrive_id++;
					}
					
				}
			}
			if(j===m-1 && currentTimetable != null){
				free_trips_of_ways_relation_id += addingTripsOfWaysCount;//currentTimetable.table.length;

				//for(let t = 0, innerTabsCount=currentTimetable.table.length, currentTab = currentTimetable.table[0]; t<innerTabsCount; currentTab = currentTimetable.table[++t]){
					free_trip_id += addingCount;
				//}
				//free_trip_id+=1;
				
			}
		}
	}

	request = request.slice(0, -1);
	//console.log(request);
	res.send(request);
    //res.send(JSON.stringify(fragments));
});

module.exports = router;


function binaryFind(array, predicateForArrayItem)
{
    let i = 0, j = array.length, k, predicateResult, currentItem; 
                                 
    while (i < j){
        k = ~~((i+j)/2);
        currentItem = array[k];
        predicateResult = predicateForArrayItem(currentItem, k, array);

        if (predicateResult === 0) return currentItem;
        else if (predicateResult === 1) j = k;
        else i = k+1;
    }
    return null;
}
function getFindingTimetableFunc(stationCode, routeCode) {
	return function(element, index, array){
		if (element.stationCode > stationCode) return 1;
		else if (element.stationCode === stationCode){
			if (element.routeCode === routeCode) return 0;
			else if (element.routeCode > routeCode) return 1;
			return -1;
		}
		return -1;
	}
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








