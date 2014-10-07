//post.js

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var postSchema = new Schema( { 
    author: String,
    text: String,
    timestamp: Date
});

module.exports = postSchema;