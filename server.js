var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var logger = require('nlogger').logger(module);

// var passport = require('passport');
// var LocalStrategy = require('passport-local').Strategy;

logger.info('info message');
logger.debug('debug message');

app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// parse application/vnd.api+json as json
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));

app.use(function (req, res, next) {
  console.log('bp: ', req.body); // populated!
  next();
});

//Refactor 

var users = [
    { 
        id: 'cristianstrat', 
        name: 'Christian Strat',
        password: 'hello',
        picture: '/assets/images/cristian-strat.png'
    },
    { 
        id: 'johnmaeda', 
        name: 'John Maeda',
        password: 'hello',
        picture: '/assets/images/cristian-strat.png'
    },
    { 
        id: 'clarkewolfe', 
        name: 'Clarke Wolfe',
        password: 'hello',
        picture: '/assets/images/cristian-strat.png'
    },
    { 
        id: 'fastcompany', 
        name: 'Fast Company',
        password: 'hello',
        picture: '/assets/images/cristian-strat.png'
    }
];

var posts = [
    { 
        id: 1,
        author: 'cristianstrat', 
        text: 'Great team constantly learn and re-learn how to move from the ego of *I* to the ego of *WE*.',
        timestamp: '2013-08-22T14:06:00+08:00'
    },
    {
        id: 2,
        author: 'clarkewolfe', 
        text: 'Listen, I don\'t want to brag about my awesome #gaming skills but someone made it into an @IGN article today...',
        timestamp: '2014-01-22T14:06:00+08:00'
    },
    { 
        id: 3,
        author: 'fastcompany', 
        text: 'THIS APP IS LIKE A REMOTE CONTROL FOR YOUR CREDIT CARDS',
        timestamp: '2014-08-22T14:17:37+08:00'
    },
    { 
        id: 4,
        author: 'fastcompany', 
        text: 'Leica is celebrating its 100th birthday by launching an entirely new camera system. Born out of a design partnership with Audi, the unibody Leica T is an APS-C-sensored minimalistic masterpiece.',
        timestamp: '2014-08-22T14:06:00+08:00'
    }
];

// app.post('/login', passport.authenticate('local'), function (req, res) {
//     res.redirect('/users/' + req.user.username);
// });

app.get('/api/posts', function (req, res) {
    res.send( { posts: posts } );
});

app.post('/api/posts', function (req, res) {
    var id = posts.length + 1;
    var post = {
        id: id,
        author: req.body.post.author,
        text: req.body.post.text,
        timestamp: req.body.post.timestamp
    };

    posts.push(post);
    res.send( { post: post } );
       
});

app.get('/api/users', function (req, res) {
//    console.log('req user: ', req.query.username, req.query.password);

    if (req.query.operation === 'login') {
        
        for (var i = 0; i < users.length; i++) {
            if (users[i].id === req.query.username) {
                console.log('user array: ', users[i].id, req.query.username);
                res.send( { users: [users[i]] } );
            }
        }
        // check in array users for password and user
        //var user = //find user in array. ;
        // Send the user back to Ember. expecting back an array. so it will only an array with on user. 
        // res.send( { users: [user] } );    
    } else {
        res.send({users: users});
    }
    
});

app.post('/api/users', function (req, res) {
    //user should be inputed into 
    console.log('req: ', req.body.user);
    users.push(req.body.user);
    res.send( { user: req.body.user } );

});

app.delete('/api/posts/:post_id', function(req, res) {

    console.log('posts params: ', req.params.post_id, typeof(req.params.post_id));
    var index = parseInt(req.params.post_id);

    for (var i = 0, j = posts.length; i < j; i++) {
        
        if (posts[i].id === index) {
            posts.splice(i, 1);
            break;
        }
    }
    res.send({});
});

app.get('/api/users/:user_id', function (req, res) {
    //look into user array. 
    //req.params.user_id;
    //res.send( { user: foundUser } );

    for (var i = 0, j = users.length; i < j; i++) {
        if (req.params.user_id === users[i].id) {
            res.send( { 'user': users[i] } );
            break;
        }
    }
});



var server = app.listen(3000, function() {
    console.log('Serving on: ', server.address().port);
});

