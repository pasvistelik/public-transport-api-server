import CollectorConfig from './config';

var collectingStarted = false;

function continuePositionsUpdating(){
    if(!collectingStarted) return;
    for (let i = 0, n = PositionsCollector.scrapers.length, currentScraper = PositionsCollector.scrapers[0]; i < n; currentScraper = PositionsCollector.scrapers[++i]){
        let vehicles = currentScraper.getVehicles();
        for (let j = 0, m = vehicles.length, currentVehicle = vehicles[0]; j < m; currentVehicle = vehicles[++j]){
            if(currentVehicle.globalId == null){
                const index = PositionsCollector.vehicles.length;
                currentVehicle.globalId = index;
                PositionsCollector.vehicles[index] = currentVehicle;
            }
        }
    }
    setTimeout(continuePositionsUpdating, CollectorConfig.updatingInterval);
}

class PositionsCollector{
    static scrapers = [];
    static vehicles = [];
    constructor(){
        throw new Error("PositionsCollector is a static class!");
    }
    static async use(scraperClass, routes){
        let scraper = new scraperClass();
        await scraper.initialize(routes, CollectorConfig.updatingInterval);

        PositionsCollector.scrapers.push(scraper);
    }
    static startCollect(){
        if (collectingStarted) return;
        collectingStarted = true;
        continuePositionsUpdating();
    }
}

export default PositionsCollector;