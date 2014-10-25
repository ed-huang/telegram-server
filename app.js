var express = require('express');
var app = express();
var db = require('./database/database');

require('./express_config')(app);
require('./router')(app);


app.use(function(err, req, res, next) {
    if (err) throw err;
    res.status(err.status || 500);
});

db.once('open', function() {
    var server = app.listen(3000, function() {
        console.log('Serving on: ', server.address().port, '**************************************');
    });    
});

