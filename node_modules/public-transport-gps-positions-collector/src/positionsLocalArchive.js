var archive = [];
var posIndex = 0;

class Position {
    constructor(vehicle){

        this.previousPosition = vehicle.lastPositionObj;
        this.previousPositionId = (vehicle.lastPositionId == null) ? null : vehicle.lastPositionId;
        
        this.positionId = posIndex++;

        this.nextPosition = null;
        this.nextPositionId = null;
        
        this.lat = vehicle.lat;
        this.lng = vehicle.lng;
        //this.timestamp = vehicle.timestamp;

        let tmpDate = vehicle.date;

        this.dateDDMMYY = tmpDate.toLocaleDateString();//example: "01.01.2017"
        this.dayOfWeek = tmpDate.getDay();// 0 -- 6
        this.timeSeconds = tmpDate.getSeconds() + 60 * tmpDate.getMinutes() + 3600 * tmpDate.getHours();//time in seconds from day begin

        this.routeId = (vehicle.route != null) ? vehicle.route.routeId : null;
        this.routeCode = (vehicle.route != null) ? vehicle.route.hashcode : null;
        this.wayId = (vehicle.way != null) ? vehicle.way.wayId : null;
        this.tripId = (vehicle.trip != null) ? vehicle.trip.tripId : null;

        if(vehicle.lastPositionObj != null){
            vehicle.lastPositionObj.nextPosition = this;
            vehicle.lastPositionObj.nextPositionId = this.positionId;
            vehicle.lastPositionObj.previousPosition = null;
        }
        vehicle.lastPositionObj = this;
        vehicle.lastPositionId = this.positionId;
    }
}
class PositionsLocalArchive {
    constructor(){
        throw new Error("PositionsLocalArchive is a static class!");
    }
    static getLatestPositions(){
        throw new Error("Not implemented!");
    }
    static push(vehicle){
        archive.push(new Position(vehicle));
    }
    static ejectAll(){
        var result = archive;
        archive = [];
        return result;
    }
}

export default PositionsLocalArchive;