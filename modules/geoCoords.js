class GeoCoords {
    static distance(a, b) {
        const earthRadius = 6372795;
        const pi180 = 0.017453;// 29251//Math.Round(Math.PI / 180, 5);
        var zz = 1, yy = 1;
        function taylorSin(x) {
            yy = x * x;
            zz = x;
            return zz - (zz *= yy) / 6 + (zz *= yy) / 120;
        }
        function taylorCos(x) {
            yy = x * x;
            zz = yy;
            return 1 - (yy) / 2 + (zz *= yy) / 24;
        }
        function taylorAtan(x) {
            yy = x * x;
            zz = x;
            return zz - (zz *= yy) / 3 + (zz *= yy) / 5 - (zz *= yy) / 7 + (zz *= yy) / 9 - (zz *= yy) / 20;
        }

        // перевести координаты в радианы
        var lat1 = a.lat * pi180;
        var lat2 = b.lat * pi180;
        var long1 = a.lng * pi180;
        var long2 = b.lng * pi180;

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

        return dist;
    }
}

module.exports = GeoCoords;