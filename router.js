var app = express();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('./connection').User;
var Post = require('./connection').Post;

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false })); // parse application/json // used for POST and parsed request.body
app.use(bodyParser.json()); // parse application/vnd.api+json as json
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(session({ secret: 'keyboard cat', resave: true, saveUninitialized: true, rolling: true }));
app.use(passport.initialize());
app.use(passport.session());