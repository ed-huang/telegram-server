//database.js

// var mongoose = require('mongoose');
var db_name = require('./config').DATABASE_NAME;
var db_host_name = require('./config').HOST_NAME;
var mongoose = require('mongoose');
var userSchema = require('./user');
var postSchema = require('./post');

mongoose.connect('mongodb://'+ db_host_name +'/'+ db_name);

mongoose.connection.model('User', userSchema);
mongoose.connection.model('Post', postSchema);

module.exports = mongoose.connection;

