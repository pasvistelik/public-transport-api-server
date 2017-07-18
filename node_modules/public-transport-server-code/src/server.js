import OptimalRoutesCollection from 'public-transport-find-optimal-ways/lib/optimalRoutesCollection';
import DataProvider from './dataProvider';
import ApiConfig from './config';



class AppServer {    
    // Find optimal ways between two points. The start time, reserved time, going speed and transport types are known.
    static async findWays(fromPositionStr, toPositionStr, myStartTimeStr, my_dopTimeMinutes, my_speed, typesStr) {
        var findedOptimalWays = null;
        var minimalTimeSeconds = 0;
        var minimalGoingTimeSeconds = 0;
        var minimalTransportChangingCount = 0;
        try { 
            findedOptimalWays = await getCountedWays(fromPositionStr, toPositionStr, myStartTimeStr, my_dopTimeMinutes, my_speed, typesStr);
        } finally{
            if (findedOptimalWays != null && findedOptimalWays.length !== 0) {

                minimalTimeSeconds = parseFloat(findedOptimalWays[0].totalTimeSeconds);
                minimalGoingTimeSeconds = parseFloat(findedOptimalWays[0].totalGoingTimeSeconds);
                minimalTransportChangingCount = parseFloat(findedOptimalWays[0].totalTransportChangingCount);
                for (let i = 1; i < findedOptimalWays.length; i++) {
                    if (parseFloat(findedOptimalWays[i].totalTimeSeconds) < minimalTimeSeconds) minimalTimeSeconds = parseFloat(findedOptimalWays[i].totalTimeSeconds);
                    if (parseFloat(findedOptimalWays[i].totalGoingTimeSeconds) < minimalGoingTimeSeconds) minimalGoingTimeSeconds = parseFloat(findedOptimalWays[i].totalGoingTimeSeconds);
                    if (parseFloat(findedOptimalWays[i].totalTransportChangingCount) < minimalTransportChangingCount) minimalTransportChangingCount = parseFloat(findedOptimalWays[i].totalTransportChangingCount);
                }
                if (minimalTransportChangingCount < 1) minimalTransportChangingCount = 1;
            }
            return findedOptimalWays;
        }
    }
}

function strToCoords(str) {
    if (str === undefined || str == null) return undefined;
    var tmp = str.split(',');
    var myLat = parseFloat(tmp[0]);
    var myLng = parseFloat(tmp[1]);
    if (myLat >= -90 && myLat <= 90 && myLng >= -180 && myLng <= 180) return { lat: myLat, lng: myLng };
    else return undefined;
}
function strToSeconds(str) {
    if (str === undefined || str == null) return undefined;
    var tmp = str.split(':');
    var hours = parseInt(tmp[0], 10);
    var minutes = parseInt(tmp[1], 10);
    if (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) return 3600 * hours + 60 * minutes;
    else return undefined;
}

async function getCountedWays(fromPositionStr, toPositionStr, myStartTimeStr, my_dopTimeMinutes, my_speed, typesStr) {
    console.log("Start counting...");

    var startOptimalRoutePoint = strToCoords(fromPositionStr);
    var finalOptimalRoutePoint = strToCoords(toPositionStr);
    var myStartTime = strToSeconds(myStartTimeStr);

    if (startOptimalRoutePoint === undefined || finalOptimalRoutePoint === undefined || myStartTime === undefined) return null;

    var types = null;
    if (typesStr !== undefined) types = typesStr.split(',');
    if (types === undefined || types == null) types = ["bus", "trolleybus"];

    var startInitializingMoment = Date.now();

    var params = {
        startOptimalRoutePoint: startOptimalRoutePoint,
        finalOptimalRoutePoint: finalOptimalRoutePoint,
        startTime: myStartTime,
        transportTypes: types,
        goingSpeed: parseFloat(my_speed), 
        dopTimeMinutes: parseFloat(my_dopTimeMinutes)
    };
    
    await DataProvider.loadDataAndInitialize();
    var res = new OptimalRoutesCollection(
        DataProvider.getAllStations(), 
        params.startOptimalRoutePoint, 
        params.finalOptimalRoutePoint, 
        params.startTime,
        params.transportTypes,
        params.goingSpeed,
        params.dopTimeMinutes
    );
    console.log(res);
    var findedOptimalWays = res.getOptimalWays();
    console.log(findedOptimalWays);

    
    console.log("Finded " + findedOptimalWays.length + " optimal routes. Time = " + (Date.now() - startInitializingMoment) + " ms.");

    return findedOptimalWays;
}

export default AppServer;