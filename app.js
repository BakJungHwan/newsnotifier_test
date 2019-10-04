const express = require('express');
const path = require('path');
const favicon = require('static-favicon');
const logger = require('morgan');
const bodyparser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');

const home = require('./routes/home');
//const newsnotifier_apis = require('./routes/newsnotifier/apis');
// const kakao_apis = require('./routes/kakao/apis');
const telegram_apis = require('./routes/telegram/apis');
const apis = require('./routes/apis');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(session({
	secret: '12kljhfd09kljetw8',
	resave: false,
	saveUninitialized: true
	
}));

app.use(favicon());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', home);
//app.use('/newsnotifier_apis', newsnotifier_apis);
app.use('/telegram_apis', telegram_apis);
// app.use('/kakao_apis', kakao_apis);
app.use('/apis', apis);

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
