"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var GeoCoords = function () {
    function GeoCoords() {
        _classCallCheck(this, GeoCoords);
    }

    _createClass(GeoCoords, null, [{
        key: "distance",
        value: function distance(a, b) {
            var earthRadius = 6372795;
            var pi180 = 0.017453; // 29251//Math.Round(Math.PI / 180, 5);
            var zz = 1,
                yy = 1;
            function taylorSin(x) {
                yy = x * x;
                zz = x;
                return zz - (zz *= yy) / 6 + (zz *= yy) / 120;
            }
            function taylorCos(x) {
                yy = x * x;
                zz = yy;
                return 1 - yy / 2 + (zz *= yy) / 24;
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
            var ad = Math.atan2(y, x); //taylorAtan(y/x);
            var dist = Math.ceil(ad * earthRadius); //(int)Math.Round(ad * earthRadius, 0);

            return dist;
        }
    }]);

    return GeoCoords;
}();

module.exports = GeoCoords;