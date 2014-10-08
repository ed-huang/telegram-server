// var mongoose = require('mongoose');

var db_name = require('./config').DATABASE_NAME;
var db_host_name = require('./config').HOST_NAME;

mongoose.connect('mongodb://'+ db_host_name +'/'+db_name);

// var Schema = mongoose.Schema;
// var userObject = require('./user');
var postObject = require('./post');
// var userSchema = new Schema(userObject);
var postSchema = new Schema(postObject);
var User = mongoose.model('User', userSchema);
var Post = mongoose.model('Post', postSchema);

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

module.exports.User = User;
module.exports.Post = Post;
module.exports.mongoose = mongoose;
