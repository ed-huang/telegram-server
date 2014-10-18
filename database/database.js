//database.js
var logger = require('nlogger').logger(module);
logger.info('load database.js');

var db_name = require('../config').DATABASE_NAME;
var db_host_name = require('../config').HOST_NAME;
var mongoose = require('mongoose');
var userSchema = require('../schemas/user');
var postSchema = require('../schemas/post');

mongoose.connect('mongodb://'+ db_host_name +'/'+ db_name);

mongoose.connection.model('User', userSchema);
mongoose.connection.model('Post', postSchema);

module.exports = mongoose.connection;


