"use strict";

require('./loadData');

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Initailize.
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

global.initialized = false;

function initialize(allStations, allRoutes, allTimetables) {
    //alert(allStations.length);
    //alert(allRoutes.length);
    //alert(allTimetables.length);

    console.log("Start initializing...");
    var startInitializingMoment = Date.now();

    var tmpUsedStations = new Array();

    function bindRoutesStationsTimetables(station, tmpArr, tabArr) {
        if (station.routes == null) station.routes = new Array();
        if (!station.routes.includes(rr)) station.routes.push(rr);
        tmpArr.push(station);

        var tmp = allTimetables.find(function (element, index, array) {
            return element.stationCode == station.hashcode && element.routeCode == rr.hashcode;
        });
        var tmpTab = tmp == undefined ? null : tmp;

        tabArr.push(tmpTab);
    }

    for (var i = 0, n = allRoutes.length, rr = allRoutes[0]; i < n; rr = allRoutes[++i]) {

        rr.getNextStation = function (currentStation) {
            for (var j = 0; j <= 1; j++) {
                for (var t = 0, nn = this.stations[j].length; t < nn; t++) {
                    if (this.stations[j][t] == currentStation) {
                        if (t + 1 != nn) return this.stations[j][t + 1];else return null;
                    }
                }
            }
            return null;
        };
        rr.getPreviousStation = function (currentStation) {
            for (var j = 0; j <= 1; j++) {
                for (var t = 0, nn = this.stations[j].length; t < nn; t++) {
                    if (this.stations[j][t] == currentStation) {
                        if (t != nn) return this.stations[j][t - 1];else return null;
                    }
                }
            }
            return null;
        };
        rr.getTimetable = function (station) {
            for (var j = 0; j <= 1; j++) {
                for (var i = 0, n = this.stations[j].length; i < n; i++) {
                    if (this.stations[j][i] == station) {
                        return this.timetables[j][i];
                    }
                }
            }
            return null;
        };

        if (rr.stationsCodes != null) {

            try {
                //if (rr.stationsCodes[rr.stationsCodes.Length - 1] != ']') continue;//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

                rr.stations = new Array(2);
                rr.timetables = new Array(2);

                for (var index = 0, tmpArr = new Array(), tabArr = new Array(); index <= 1; index++) {
                    var rr_stationsCodes = rr.stationsCodes;
                    for (var j = 0, m = rr_stationsCodes[index].length, stationCode = rr_stationsCodes[index][0]; j < m; stationCode = rr_stationsCodes[index][++j]) {
                        var tmpUsed = false;
                        for (var k = 0, mn = allStations.length, station = allStations[0]; k < mn; station = allStations[++k]) {
                            if (station != null && station.hashcode == stationCode) {
                                bindRoutesStationsTimetables(station, tmpArr, tabArr);
                                tmpUsed = true;
                                break;
                            }
                        }
                        if (!tmpUsed) {
                            for (var k = 0, mn = allStations.length, station = allStations[0]; k < mn; station = allStations[++k]) {
                                if (station != null && station.hashcode == stationCode) {
                                    bindRoutesStationsTimetables(station, tmpArr, tabArr);
                                    if (!tmpUsedStations.includes(station)) tmpUsedStations.push(station);
                                    break;
                                }
                            }
                        }
                    }
                    rr.stations[index] = tmpArr;
                    rr.timetables[index] = tabArr;
                }
            } catch (ex) {
                console.log(ex.message);
                continue;
            }
        }
    }

    for (var i = 0, n = allTimetables.length, timetable = allTimetables[0]; i < n; timetable = allTimetables[++i]) {
        timetable.findTimeAfter = function (time) {
            var dateTmp = new Date();
            dateTmp.setMinutes(0);
            dateTmp.setHours(0);
            dateTmp.setSeconds(time);
            var day = dateTmp.getDay();
            //foreach (Table t in table)
            for (var kkk = 0, mnkk = this.table.length, t = this.table[0]; kkk < mnkk; t = this.table[++kkk]) {
                if (t.days.includes(day)) {

                    //foreach (SimpleTime st in t.times)
                    for (var iik = 0, mnii = t.times.length, st = t.times[0], stTime; iik < mnii; st = t.times[++iik]) {
                        //MessageBox.Show("���������: �������� � " + TimeSpan.FromMinutes(st.hour * 60 + st.minute).ToString()+", �� � "+ TimeSpan.FromSeconds(time.Second + time.Minute * 60 + time.Hour * 3600).ToString());
                        //
                        if ((stTime = st.hour * 3600 + st.minute * 60) >= time /*.Second + time.Minute * 60 + time.Hour * 3600*/ /*time.Hour >= st.hour && time.Minute >= st.minute*/) {
                                //MessageBox.Show("��������� �����: " + st.ToString());
                                return stTime - time /*TimeSpan.FromSeconds(time.Second + time.Minute * 60 + time.Hour * 3600)*/;
                            }
                    }
                    if (t.times.length != 0) return t.times[0].hour * 3600 + t.times[0].minute * 60 - time /*TimeSpan.FromSeconds(time.Second + time.Minute * 60 + time.Hour * 3600)*/ + 86400;
                    break;
                }
            }
            return 2160000000;
            //throw new Exception();
        };
        timetable.findTimeBefore = function (time) {
            var dateTmp = new Date();
            dateTmp.setMinutes(0);
            dateTmp.setHours(0);
            dateTmp.setSeconds(time);
            var day = dateTmp.getDay();
            for (var kkk = 0, mnkk = this.table.length, t = this.table[0], ok = false, st; kkk < mnkk; t = this.table[++kkk]) {
                if (t.days.includes(day)) {
                    ok = false;
                    st = null;
                    for (var iik = 0, mnii = t.times.length, stt = t.times[0]; iik < mnii; stt = t.times[++iik]) {
                        //MessageBox.Show("���������: �������� � " + TimeSpan.FromMinutes(st.hour * 60 + st.minute).ToString()+", �� � "+ TimeSpan.FromSeconds(time.Second + time.Minute * 60 + time.Hour * 3600).ToString());
                        //
                        if (stt.hour * 3600 + stt.minute * 60 <= time /*time.Hour >= st.hour && time.Minute >= st.minute*/) {
                                ok = true;
                                st = stt;
                                //MessageBox.Show("��������� �����: " + st.ToString());
                            } else break;
                    }
                    if (ok) return st.hour * 3600 + st.minute * 60 - time;
                    if (t.times.length != 0) return t.times[0].hour * 3600 + t.times[0].minute * 60 - time - 86400;
                    break;
                }
            }
            return 0; //TimeSpan.FromDays(0/*-25000*/);
            //throw new Exception();
        };
    }

    for (var i = 0, n = allStations.length, currentStation = allStations[0]; i < n; currentStation = allStations[i]) {
        if (currentStation.routes == undefined || currentStation.routes == null || currentStation.routes.length == 0) {
            allStations.splice(i, 1);
            n = allStations.length;
        } else i++;
    }

    console.log("Initialized. Time = " + (Date.now() - startInitializingMoment) + " ms.");
    //console.log("\n\n" + JSON.stringify(allTimetables[0]) + "\n\n");
    //alert(distance({ lat: allStations[0].xCoord, lng: allStations[0].yCoord }, { lat: allStations[5].xCoord, lng: allStations[5].yCoord }));


    //for (var t = 0; t < 1000; t++) var ttt = GetStationsAround(allStations[0].coords, 30000).length;
    //console.log("test. Time = " + (Date.now() - startInitializingMoment) + " ms.");


    global.initialized = true;
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// End initailize.
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


function loadData() {
    if (global.allStationsLoaded && global.allRoutesLoaded && global.allTimetablesLoaded) {
        initialize(global.allStations, global.allRoutes, global.allTimetables);
    } else setTimeout(loadData, 50);
}
loadData();