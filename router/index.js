var logger = require('nlogger').logger(module);
var express = require('express');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('./passport-aunthenticate');

module.exports = function (app) {
    logger.info('router index module loading');
    

    app.use(cookieParser());
    app.use(bodyParser.urlencoded({ extended: false })); // parse application/json // used for POST and parsed request.body
    app.use(bodyParser.json()); // parse application/vnd.api+json as json
    app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
    app.use(session({ secret: 'keyboard cat', resave: true, saveUninitialized: true, rolling: true }));
    app.use(passport.initialize());
    app.use(passport.session());

    app.use('/api/users', require('./routes/user/user-routes'));
    app.use('/api/posts', require('./routes/post/post-routes'));

//     app.get('/api/users', function(req, res) {
//     logger.info('GET /users/');

//     if (req.query.operation === 'login') {
//         logger.info('req.query.operation = login - username: ', req.query.username);

//         passport.authenticate('local', function(err, user, info) {
//             logger.info("passport.authenticate() - user.id: ", user.id);

//             if (err) { 
//                 logger.error('Passport authenticate error in authenticating');
//                 return res.status(500).end(); 
//             }
            
//             if (!user) { 
//                 return res.status(404).end(); 
//             }
            
//             req.logIn(user, function(err) {
//                 if (err) { 
//                     logger.info('if err in req.login() user.id: ', user);
//                     logger.error('Something wrong with res.login()', err);
//                     return res.status(500).end(); 
//                 }

//                 return res.send({ users: [removePassword(user)] } );
//             });
//         })(req, res);

//     //Used when viewing other users profile. 
//     //If he is logged in then it will fire true and return the current user;
//     } else if (req.query.operation === 'authenticating') {
//         logger.info('isAuthenticated: ', req.isAuthenticated());
        
//         if (req.isAuthenticated()) {
//             return res.send({ users:[removePassword(req.user)] });
//         } else {
//             return res.send({ users: [] } );    
//         }

//     } else if (req.query.operation === 'following') {
//         logger.info('GET /users/ req.query.operation = following - req.query.curUser: ', req.query.curUser);
        
//         var emberArray = [];
        
//         User.findOne({ id: req.query.curUser }, function (err, curUser) {
//             if (err) return res.status(403).end();
//             User.find({ id: { $in: curUser.following }}, function (err, following) {
//                 logger.info('Fn find() curUser.following - following: ', curUser.following);
//                 if (err) return res.status(403).end();
//                 //*** maybe use forEach ?
//                 following.forEach(function (follower) {
//                     var u = removePassword(follower);
//                     u = setIsFollowed(u, req.user);
//                     emberArray.push(u);
//                 });
                
//                 return res.send({ users: emberArray });
//             });
//         });

//     } else if (req.query.operation === 'followers') {
//         logger.info('Getting followers for: ', req.query.curUser);
        
//         var emberArray = [];
        
//         User.findOne({ id: req.query.curUser }, function (err, curUser) {
//             if (err) return res.status(403).end();
            
//             User.find({ id: { $in: curUser.followers }}, function (err, followers) {
//                 if (err) return res.status(403).end();

//                 followers.forEach(function (follower) {
//                     var u = removePassword(follower);
//                     u = setIsFollowed(u, req.user);
//                     emberArray.push(u);
//                 });

//                 return res.send({ users: emberArray });
//             });
//         });
//     } else {
//         logger.info('find all users');
//         User.find({}, function (err, users) {
//             return res.send({ users: users } );    
//         })
        
//     }
// });

    
};