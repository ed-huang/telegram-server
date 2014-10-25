var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var passport = require('./passport/passport-authenticate');
var session = require('express-session');

module.exports = function (app) {
    app.use(cookieParser());
    app.use(bodyParser.urlencoded({ extended: false })); // parse application/json // used for POST and parsed request.body
    app.use(bodyParser.json());
    app.use(session({ secret: 'keyboard cat', resave: true, saveUninitialized: true, rolling: true }));
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(cookieParser());
};
