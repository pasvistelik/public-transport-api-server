import ApiConfig from './config';
var fetch = require('node-fetch');
import initialize from 'public-transport-initialize-data';

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Load data.
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var allStations = null;
var allRoutes = null;
var allTimetables = null;

//var updatingFromServerInterval = 5000;

var loadingStarted = false;

var allStationsLoaded = false, allRoutesLoaded = false,  allTimetablesLoaded = false;
var allStationsJSON = null, allRoutesJSON = null, allTimetablesJSON = null;

async function loadDataOnly() {

    if(!allStationsLoaded){
        console.log("Downloading stations from server...");

        let response = await fetch(ApiConfig.apiGetStationsUrl);
        allStationsJSON = await response.text();
        allStations = JSON.parse(allStationsJSON);

        allStationsLoaded = true;
        console.log("Stations loaded from server.");
    }

    if(!allRoutesLoaded){
        console.log("Downloading routes from server...");

        let response = await fetch(ApiConfig.apiGetRoutesUrl);
        allRoutesJSON = await response.text();
        allRoutes = JSON.parse(allRoutesJSON);

        allRoutesLoaded = true;
        console.log("Routes loaded from server.");
    }

    if(!allTimetablesLoaded){
        console.log("Downloading timetables from server...");

        let response = await fetch(ApiConfig.apiGetTimetablesUrl);
        allTimetablesJSON = await response.text();
        allTimetables = JSON.parse(allTimetablesJSON);

        allTimetablesLoaded = true;
        console.log("Timetables loaded from server.");
    }
}

async function loadData() {
    if(!loadingStarted){
        loadingStarted = true;

        await loadDataOnly();

        if (allStationsLoaded && allRoutesLoaded && allTimetablesLoaded) {
            initialize(allStations, allRoutes, allTimetables);
        }
    }
}


//loadData();

class DataProvider {
    static getAllStations() {
        return allStations;
    }
    static getAllRoutes() {
        return allRoutes;
    }
    static getAllTimetables() {
        return allTimetables;
    }
    static getAllStationsJSON() {
        return allStationsJSON;
    }
    static getAllRoutesJSON() {
        return allRoutesJSON;
    }
    static getAllTimetablesJSON() {
        return allTimetablesJSON;
    }
    static async loadDataAndInitialize() {
        await loadData();
    }
    static async loadDataOnly() {
        await loadDataOnly();
    }
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// End load data.
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export default DataProvider;