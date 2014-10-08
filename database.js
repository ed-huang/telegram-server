//database.js

// var mongoose = require('mongoose');
// var db_name = require('./config').DATABASE_NAME;
// var db_host_name = require('./config').HOST_NAME;
var mongoose = require('./connection').mongoose;
var userSchema = require('./user');
var postSchema = require('./post');

// mongoose.connect('mongodb://'+ db_host_name +'/'+ db_name);

module.exports.user =  mongoose.model('User', userSchema);
module.exports.user =  mongoose.model('Post', postSchema);

