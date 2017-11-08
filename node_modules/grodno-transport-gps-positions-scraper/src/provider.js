import fetch from 'node-fetch';
import ProviderConfig from './config';
//ToDo: create and use this:... import binaryFind from 'binarySearch/lib/binaryFind';

class GrodnoPositionsScraper{
    async initialize(routesForAssotiating, updatingInterval = 5000){
        this.associationsWithRoutes = [];

        // Берем все известные провайдеру маршруты:
        const grodnoRoutes = await getJsonFromUrl(ProviderConfig.apiGetRoutesUrl);
        //console.log(grodnoRoutes);
        // Строим ассоциации между нашими маршрутами и маршрутами провайдера:
        for (let routeObj = grodnoRoutes[0], i = 0, n = grodnoRoutes.length; i < n; routeObj = grodnoRoutes[++i]){
            //console.log(routeObj);
            let routeType = null;
            if (routeObj.type === "А") routeType = "bus";
            else {
                console.log("Нераспознанный тип маршрута ("+routeObj.type+"):");
                //console.log(routeObj);
                continue;
            }

            let routeNum = routeObj.num;
           
            var findedRoute = null;
            for (let i = 0, currentRoute = routesForAssotiating[0], n = routesForAssotiating.length; i < n; currentRoute = routesForAssotiating[++i]) {
                if (currentRoute.number == routeNum && currentRoute.type == routeType){
                    findedRoute = currentRoute;
                    break;
                }
            }
            if (findedRoute == null){
                console.log("Нераспознанный маршрут: "+routeNum);
                //console.log(routeObj);
                continue;
            }

            this.associationsWithRoutes[parseInt(routeObj.id)] = findedRoute;
        }

        // Формируем URL запроса на получение местоположения транспорта:
        let reqRoutesIdsPart = "";
        //console.log(this.associationsWithRoutes);
        for (let obj in this.associationsWithRoutes){
        //for (let obj = this.associationsWithRoutes[0], i = 0, n = this.associationsWithRoutes.length; i < n; obj = this.associationsWithRoutes[++i]){
            reqRoutesIdsPart += obj + "-0,";
        }
        this.getPositionsUrl = ProviderConfig.apiGetPositionsUrlPart + reqRoutesIdsPart.slice(0, -1);
        //console.log("URL: "+this.getPositionsUrl);
        this.grodnoVehicles = [];

        this.updatePositions = async function(){
            let returnedVehicles = (await getJsonFromUrl(this.getPositionsUrl)).anims;
            //console.log(returnedVehicles);
            for (let vehicle = returnedVehicles[0], currentVehicleRoute, i = 0, n = returnedVehicles.length; i < n; vehicle = returnedVehicles[++i]){
                let currentVehicle = this.grodnoVehicles[parseInt(vehicle.id)];
                if (currentVehicle == null){
                    currentVehicleRoute = this.associationsWithRoutes[parseInt(vehicle.rid)];
                    if (currentVehicleRoute == null){
                        console.log("Не найдена связь с маршрутом: "+vehicle.rid);
                        continue;
                    }
                    currentVehicle = this.grodnoVehicles[parseInt(vehicle.id)] = {
                        route: currentVehicleRoute
                    };
                }
                currentVehicle.lat = vehicle.lat / 1000000;
                currentVehicle.lng = vehicle.lon / 1000000;
                currentVehicle.timestamp = vehicle.lasttime;
                currentVehicle.localId = vehicle.id;
                currentVehicle.speedInLastMoment = vehicle.speed;
                currentVehicle.way = null;
                currentVehicle.trip = null;

                //console.log(currentVehicle);
            }
        }

        
        await this.updatePositions();
        console.log("Grodno-vehicles-provider was initialized.");

        var self = this;
        setTimeout(test, updatingInterval);
        async function test(){
            await self.updatePositions();
            setTimeout(test, updatingInterval);
        }
    }

    getVehicles(){
        let result = [];
        for(let key in this.grodnoVehicles) result.push(this.grodnoVehicles[key]);
        return result;
    }

    
}



/////////////////////////////////////////////

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

async function getJsonFromUrl(strReq) {
    var response = await fetch(strReq);
    return await response.json();
}

/////////////////////////////////////////////

export default GrodnoPositionsScraper;