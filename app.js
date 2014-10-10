var express = require('express');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('./passport/passport-aunthenticate');

var app = express();

    app.use(cookieParser());
    app.use(bodyParser.urlencoded({ extended: false })); // parse application/json // used for POST and parsed request.body
    app.use(bodyParser.json()); // parse application/vnd.api+json as json
    app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
    app.use(session({ secret: 'keyboard cat', resave: true, saveUninitialized: true, rolling: true }));
    app.use(passport.initialize());
    app.use(passport.session());

var router = require('./router')(app);

// Error Handling
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
});



module.exports = app;


var server = app.listen(3000, function() {
    console.log('Serving on: ', server.address().port, '**************************************');
});