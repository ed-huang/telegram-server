var express = require('express');
var app = express();
require('./express_config')(app);

var db = require('./database/database');
var router = require('./router')(app);


app.use(function(err, req, res, next) {
    res.status(err.status || 500);
});

module.exports = app;

db.once('open', function() {
    var server = app.listen(3000, function() {
        console.log('Serving on: ', server.address().port, '**************************************');
    });    
});

