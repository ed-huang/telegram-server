var logger = require('nlogger').logger(module);
logger.info('loaded middleware');

var middleware = {};

middleware.express = require('express');
middleware.session = require('express-session');
middleware.cookieParser = require('cookie-parser');
middleware.bodyParser = require('body-parser');
middleware.passport = require('./passport/passport-aunthenticate');
middleware.db = require('./database/database');


module.exports = middleware;
