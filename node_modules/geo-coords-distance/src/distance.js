export default function distance(a, b) {
    const earthRadius = 6372795;
    const pi180 = 0.017453; // Math.PI / 180

    // перевести координаты в радианы
    var lat1 = a.lat * pi180;
    var lat2 = b.lat * pi180;
    var long1 = a.lng * pi180;
    var long2 = b.lng * pi180;

    //const pi2 = 1.5707963;
    /*var zz = 1, yy = 1;
    function taylorSin(x) {
        yy = x * x;
        zz = x;
        return zz - (zz *= yy) / 6 + (zz *= yy) / 120;
    }
    function taylorCos(x) {
        yy = x * x;
        zz = yy;
        return 1 - (yy) / 2 + (zz *= yy) / 24;
    }*/
    /*function taylorArcCos(x) {
        yy = x * x;
        zz = x;
        return pi2 - zz - (zz *= yy)/6 - 3*(zz *= yy)/40;
    }*/
    /*function taylorAtan(x) {
        yy = x * x;
        zz = x;
        return zz - (zz *= yy) / 3 + (zz *= yy) / 5 - (zz *= yy) / 7 + (zz *= yy) / 9 - (zz *= yy) / 20;
    }*/
    /*
    // косинусы и синусы широт и разницы долгот
    var cl1 = taylorCos(lat1);
    var cl2 = taylorCos(lat2);
    var sl1 = taylorSin(lat1);
    var sl2 = taylorSin(lat2);
    var delta = long2 - long1;
    var cdelta = taylorCos(delta);
    var sdelta = taylorSin(delta);

    // вычисления длины большого круга
    var tmp = cl2 * cdelta;
    var y = Math.sqrt(cl2 * cl2 * sdelta * sdelta + (cl1 * sl2 - sl1 * tmp) * (cl1 * sl2 - sl1 * tmp));
    var x = sl1 * sl2 + cl1 * tmp;

    //
    var ad = Math.atan2(y, x);//taylorAtan(y/x);
    var dist = Math.ceil(ad * earthRadius);//(int)Math.Round(ad * earthRadius, 0);

    //console.log(dist + " vs " + Math.acos(Math.sin(lat1)*Math.sin(lat2)+Math.cos(lat1)*Math.cos(lat2)*Math.cos(long1-long2))*earthRadius);
    //console.log((taylorSin(lat1)*taylorSin(lat2)+taylorCos(lat1)*taylorCos(lat2)*taylorCos(long1-long2)) + " vs " + (Math.sin(lat1)*Math.sin(lat2)+Math.cos(lat1)*Math.cos(lat2)*Math.cos(long1-long2)));

    return dist;
    */

    return Math.acos(Math.sin(lat1)*Math.sin(lat2)+Math.cos(lat1)*Math.cos(lat2)*Math.cos(long1-long2))*earthRadius;
}