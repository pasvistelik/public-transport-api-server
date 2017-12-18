var AppConfig = null;
import mysql from 'mysql';
var fetch = require('node-fetch');

import TransportDatabase from 'public-transport-database';
import initialize from 'public-transport-initialize-data';

import PositionsCollector from 'public-transport-gps-positions-collector';
import PositionsLocalArchive from 'public-transport-gps-positions-collector/lib/positionsLocalArchive';

import GrodnoPositionsScraper from 'grodno-transport-gps-positions-scraper';

var savingPositionsStarted = false;

export default class DataProvider {
    static useConfig(config){
        AppConfig = config;
    }

    static allStations = null;
    static allRoutes = null;
    static allVehicles = null;
    static allTimetables = null;

    //static updatingFromServerIntervalMiliseconds = 5000;

    static loadingStarted = false;

    static allStationsLoaded = false;
    static allRoutesLoaded = false;
    static allTimetablesLoaded = false;
    static allStationsJSON = null;
    static allRoutesJSON = null;
    //static allVehiclesJSON = null;
    static allTimetablesJSON = null;


    static getAllStations() {
        return DataProvider.allStations;
    }
    static getAllRoutes() {
        return DataProvider.allRoutes;
    }
    static getAllTimetables() {
        return DataProvider.allTimetables;
    }
    static getAllVehicles() {
        return DataProvider.allVehicles;
    }
    static getAllStationsJSON() {
        return DataProvider.allStationsJSON;
    }
    static getAllRoutesJSON() {
        return DataProvider.allRoutesJSON;
    }
    static getAllTimetablesJSON() {
        return DataProvider.allTimetablesJSON;
    }
    static getAllVehiclesJSON() {
        let result = [];
        for (let i = 0, n = DataProvider.allVehicles.length, currentVehicle = DataProvider.allVehicles[0]; i < n; currentVehicle = DataProvider.allVehicles[++i]){
            result.push({
                globalId: currentVehicle.globalId,
                routeId: currentVehicle.route.hashcode,
                lat: currentVehicle.lat,
                lng: currentVehicle.lng,
                timestamp: currentVehicle.timestamp,
                speedInLastMoment: currentVehicle.speedInLastMoment,
                //wayId: currentVehicle.way,
                //tripId: currentVehicle.trip
            });
        }
        return result;//DataProvider.allVehiclesJSON;
    }
    static async loadDataAndInitialize() {
        if(!DataProvider.loadingStarted){
            DataProvider.loadingStarted = true;

            if (AppConfig.databaseEnabled){
                await TransportDatabase.useConnection(
                    {
                        host     : AppConfig.databaseHost,
                        user     : AppConfig.databaseUser,
                        password : AppConfig.databasePassword,
                        database : AppConfig.databaseName
                    }
                );
            }

            await DataProvider.loadDataOnly();

            if (DataProvider.allStationsLoaded && DataProvider.allRoutesLoaded && DataProvider.allTimetablesLoaded) {
                initialize(DataProvider.allStations, DataProvider.allRoutes, DataProvider.allTimetables);

                PositionsCollector.startCollect();
                await PositionsCollector.use(GrodnoPositionsScraper, DataProvider.allRoutes); //todo: не allRoutes, а те, что в Гродно...

                DataProvider.allVehicles = PositionsCollector.vehicles;
            }

            savingPositionsStarted = true;
            
            if (AppConfig.databaseEnabled) continueSavingPositionsToDatabase();
        }
    }
    static async loadDataOnly() {

        if(!DataProvider.allStationsLoaded){
            console.log("Downloading stations from server...");

            let response = await fetch(AppConfig.apiGetStationsUrl);
            DataProvider.allStationsJSON = await response.text();
            DataProvider.allStations = JSON.parse(DataProvider.allStationsJSON);

            DataProvider.allStationsLoaded = true;
            console.log("Stations loaded from server.");
        }

        if(!DataProvider.allRoutesLoaded){
            console.log("Downloading routes from server...");

            let response = await fetch(AppConfig.apiGetRoutesUrl);
            DataProvider.allRoutesJSON = await response.text();
            DataProvider.allRoutes = JSON.parse(DataProvider.allRoutesJSON);

            DataProvider.allRoutesLoaded = true;
            console.log("Routes loaded from server.");
        }

        if(!DataProvider.allTimetablesLoaded){
            console.log("Downloading timetables from server...");

            let response = await fetch(AppConfig.apiGetTimetablesUrl);
            DataProvider.allTimetablesJSON = await response.text();
            DataProvider.allTimetables = JSON.parse(DataProvider.allTimetablesJSON);

            DataProvider.allTimetablesLoaded = true;
            console.log("Timetables loaded from server.");
        }
    }
}

var positionsForSave = []
async function continueSavingPositionsToDatabase(){
    //if(!savingPositionsStarted) return;
    
    try{
        let tmpPositions = PositionsLocalArchive.ejectAll();
        if(tmpPositions != null) {
            positionsForSave = positionsForSave.concat(tmpPositions);
        }
        if(positionsForSave.length !== 0) {
            await TransportDatabase.pushPositionsInPositionsTable(tmpPositions);
            console.log("Positions ("+tmpPositions.length+" points) saved to database.");
            positionsForSave = [];
        }
    }
    catch(e){
        console.log(e);
    }
    
    setTimeout(continueSavingPositionsToDatabase, 10000);
}