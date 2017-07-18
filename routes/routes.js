var express = require('express');
var router = express.Router();

import DataProvider from 'public-transport-server-code/lib/dataProvider';

/* GET users listing. */
router.get('/', async function(req, res, next) {
    await DataProvider.loadDataAndInitialize();
    res.send(DataProvider.getAllRoutesJSON());
});

module.exports = router;
