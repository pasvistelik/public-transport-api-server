"use strict";

var fetch = require('node-fetch');

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Load data.
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

global.allStations = null;
//var allStations = global.allStations;
global.allRoutes = null;
//var allRoutes = global.allRoutes;
global.allTimetables = null;
//var allTimetables = global.allTimetables;

//var apiPublicTransportServer = "http://adsghdfsjgdj-001-site1.gtempurl.com/api/";
var apiPublicTransportServer = "http://localhost:6967/api/";

var updatingFromServerInterval = 5000;

global.allStationsLoaded = false, global.allRoutesLoaded = false, global.allTimetablesLoaded = false;
global.allStationsJSON = null, global.allRoutesJSON = null, global.allTimetablesJSON = null;

console.log("Downloading stations from server...");
var strGetStations = apiPublicTransportServer + "stations/";
strGetStations = "json/stations.json";
strGetStations = "https://publictransportproject.000webhostapp.com/new/json/stations.json";
//strGetStations = "http://ptp.local/json/stations.json";
fetch(strGetStations).then(function (response) {
    response.text().then(function (data) {
        global.allStations = JSON.parse(global.allStationsJSON = data);
        global.allStationsLoaded = true;
        console.log("Stations loaded from server.");
    });
});

console.log("Downloading routes from server...");
var strGetRoutes = apiPublicTransportServer + "routes/";
strGetRoutes = "json/routes.json";
strGetRoutes = "https://publictransportproject.000webhostapp.com/new/json/routes.json";
//strGetRoutes = "http://ptp.local/json/routes.json";
fetch(strGetRoutes).then(function (response) {
    response.text().then(function (data) {
        global.allRoutes = JSON.parse(global.allRoutesJSON = data);
        global.allRoutesLoaded = true;
        console.log("Routes loaded from server.");
    });
});

console.log("Downloading timetables from server...");
var strGetTimetables = apiPublicTransportServer + "timetables/";
strGetTimetables = "json/timetables.json";
strGetTimetables = "https://publictransportproject.000webhostapp.com/new/json/timetables.json";
//strGetTimetables = "http://ptp.local/json/timetables.json";
fetch(strGetTimetables).then(function (response) {
    response.text().then(function (data) {
        global.allTimetables = JSON.parse(global.allTimetablesJSON = data);
        global.allTimetablesLoaded = true;
        console.log("Timetables loaded from server.");
    });
});

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// End load data.
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////