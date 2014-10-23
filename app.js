var middle = require('./express_config');
var db = require('./database/database');

var app = middle.express();

app.use(middle.cookieParser());
app.use(middle.bodyParser.urlencoded({ extended: false }));
app.use(middle.bodyParser.json()); 
app.use(middle.bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(middle.session({ secret: 'keyboard cat', resave: true, saveUninitialized: true, rolling: true }));
app.use(middle.passport.initialize());
app.use(middle.passport.session());

var router = require('./router')(app);

// Error Handling
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
});

module.exports = app;

db.once('open', function() {
    var server = app.listen(3000, function() {
        console.log('Serving on: ', server.address().port, '**************************************');
    });    
});

