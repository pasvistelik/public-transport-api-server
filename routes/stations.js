var express = require('express');
var router = express.Router();

import DataProvider from '../modules/public-transport-server-code/dataProvider';

/* GET users listing. */
router.get('/', async function(req, res, next) {
    await DataProvider.loadDataAndInitialize();
    res.send(DataProvider.getAllStationsJSON());
});

module.exports = router;
