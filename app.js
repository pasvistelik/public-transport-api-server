import express from 'express';
import path from 'path';
import favicon from 'serve-favicon';
import logger from 'morgan';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import cors from 'cors';

import my_stations from './routes/stations';
import my_routes from './routes/routes';
import my_timetables from './routes/timetables';
import optimalRoute from './routes/optimalRoute';

import DataProvider from 'public-transport-server-code/lib/dataProvider';



var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(cors());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/*(new Promise(async function(resolve, reject) {
    await DataProvider.loadDataAndInitialize();
}));*/

/*app.use(async function () {
    await DataProvider.loadDataAndInitialize();
})*/



app.use('/stations', my_stations);
app.use('/routes', my_routes);
app.use('/timetables', my_timetables);

app.use('/optimalRoute', optimalRoute);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;