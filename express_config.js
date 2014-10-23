var middleware = {};

middleware.express = require('express');
middleware.session = require('express-session');
middleware.cookieParser = require('cookie-parser');
middleware.bodyParser = require('body-parser');
middleware.passport = require('./passport/passport-authenticate');
middleware.db = require('./database/database');


module.exports = middleware;
