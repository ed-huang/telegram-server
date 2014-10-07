//user.js

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema( {
    id: String,
    name: String,
    password: String,
    picture: String,
    followers: [String],
    following: [String]
});

module.exports = userSchema;