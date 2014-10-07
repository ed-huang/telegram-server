//database.js

var mongoose = require('mongoose');
var db_name = require('./config').DATABASE_NAME;
var db_host_name = require('./config').HOST_NAME;
var userSchema = require('./user');
var postSchema = require('./post');

mongoose.connect('mongodb://'+ db_host_name +'/'+ db_name);

module.exports.User = mongoose.model('User', userSchema);
module.exports.Post = mongoose.model('Post', postSchema);

