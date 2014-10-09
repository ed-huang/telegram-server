var express = require('express');

var app = express();

var router = require('./router/index')(app);

// Error Handling
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
});

module.exports = app;

var server = app.listen(3000, function() {
    console.log('Serving on: ', server.address().port, '**************************************');
});