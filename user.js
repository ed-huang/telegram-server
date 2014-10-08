//user.js
// var mongoose = require('./connection').mongoose;
// var Schema = mongoose.Schema;

var userSchema = {
    id: String,
    name: String,
    password: String,
    picture: String,
    followers: [String],
    following: [String]
};

module.exports = userSchema;