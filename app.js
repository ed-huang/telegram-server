console.log('app.js loaded');

var express = require('express');
var app = express();
var http = require('http').Server(app);
var db = require('./database/database');

require('./express_config')(app);
var io = require('./socket/socket.io-config')(http);



require('./router')(app, io);


app.use(function(err, req, res, next) {
    if (err) throw err;
    res.status(err.status || 500);
});

db.once('open', function() {
    var server = http.listen(3000, function() {
        console.log('Serving on: ', server.address().port, '**************************************');
    });
});






