var connConfig = null;
import mysql from 'mysql';

var freeIndexInPositionsTable = 0;

class TransportDatabase {
    static async useConnection(conn){
      connConfig = conn;
      connConfig.multipleStatements = true;

      let index = await TransportDatabase.getNextFreeIndexInPositionsTable();
      freeIndexInPositionsTable = index;
      console.log("freeIndexInPositionsTable = "+freeIndexInPositionsTable);
    }
    constructor(){
        throw new Error("TransportDatabase is a static class!");
    }
    static async getPositionsArchive(){
      //...
      return await executeQuery("SELECT * from `gps_positions_archive`");
    }
    static async getNextFreeIndexInPositionsTable(){
      const results = await executeQuery("SELECT (SELECT MAX(`position_id`) FROM `gps_positions_archive`) AS solution");
      console.log(results[0]);
      console.log(results[0].solution);
      return results[0].solution == null ? 0 : results[0].solution + 1;
    }
    static async pushPositionsInPositionsTable(positions){
      if (positions == null || positions.length === 0) return;
      let request = "";
      let request_begin = "INSERT INTO gps_positions_archive(`position_id`, `previous_position_id`, `next_position_id`, `lat`, `lng`, `vehicle_id`, `date`, `day_of_week`, `time_seconds`, `route_id`, `way_id`, `trip_id`) VALUES";

      for(let i = 0, n = positions.length, currentItem = positions[0]; i < n; currentItem = positions[++i]){
        request += request_begin + " ("
        + (currentItem.positionId + freeIndexInPositionsTable) + ", "
        + (currentItem.previousPositionId == null ? "NULL" : (currentItem.previousPositionId + freeIndexInPositionsTable)) + ", "
        + "NULL, "//(currentItem.nextPositionId == null ? "null" : (currentItem.nextPositionId + freeIndexInPositionsTable)) + ", "
        + currentItem.lat + ", "
        + currentItem.lng + ", "
        + (currentItem.vehicleId == null ? "NULL" : currentItem.vehicleId) + ", "
        + "\"" + currentItem.dateDDMMYY + "\", "
        + currentItem.dayOfWeek + ", "
        + currentItem.timeSeconds + ", "
        + (currentItem.routeCode/*Id*/ == null ? "NULL" : "(SELECT `route_id` FROM `routes` WHERE `tmp_route_hashcode`=\""+currentItem.routeCode/*Id*/+"\" LIMIT 1)") + ", "
        + (currentItem.wayId == null ? "NULL" : currentItem.wayId) + ", "
        + (currentItem.tripId == null ? "NULL" : currentItem.tripId)
        + "); ";

        if(currentItem.previousPositionId != null){
          request += "UPDATE `gps_positions_archive` SET `next_position_id`="+(currentItem.positionId + freeIndexInPositionsTable)+" WHERE `position_id`="+(currentItem.previousPositionId + freeIndexInPositionsTable)+" LIMIT 1; ";
        }
      }
      request = request.slice(0, -1);
      //console.log("\n\nrequest:");
      //console.log(request);
      //console.log("\n\n");

      let results = await executeQuery(request);
      if(results == null) throw new Error();
      //console.log("\n\nresults: ");
      //console.log(results);
      //console.log("\n\n");
      //...
    }
}

async function executeQuery(query){
  let connection = null;
  try{
    connection = mysql.createConnection(connConfig)
    connection.connect();
    var promise = new Promise(function (resolve, reject) {
      connection.query(query, function (error, results, fields) {
        //console.log(results);
        if (results) {
          resolve(results);
          return results;
        }
        if (error) reject(error);
      });
    });
    return await promise;
  }
  catch(e){
    console.log(e.message);
    return null;
  }
  finally{
    if(connection != null) connection.end();
  }
}

export default TransportDatabase;