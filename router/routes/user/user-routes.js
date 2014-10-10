
var logger = require('nlogger').logger(module);
var express = require('express');
var async = require('async');
var passport = require('../../../passport/passport-aunthenticate');

var router = express.Router();
var db = require('../../../database/database.js');
var User = db.model('User');

/**
* User LOGIN or get users. Used for following and follower stream
*/
router.get('/', function(req, res) {
    logger.info('GET /users/');

    if (req.query.operation === 'login') {
        logger.info('req.query.operation = login - username: ', req.query.username);

        passport.authenticate('local', function(err, user, info) {
            logger.info("passport.authenticate() - user.id: ", user.id);

            if (err) { 
                logger.error('Passport authenticate error in authenticating');
                return res.status(500).end(); 
            }
            
            if (!user) { 
                return res.status(404).end(); 
            }
            
            req.logIn(user, function(err) {
                if (err) { 
                    logger.info('if err in req.login() user.id: ', user);
                    logger.error('Something wrong with res.login()', err);
                    return res.status(500).end(); 
                }

                return res.send({ users: [removePassword(user)] } );
            });
        })(req, res);
    }        
    //Used when viewing other users profile. 
    //If he is logged in then it will fire true and return the current user;
    
    else if (req.query.operation === 'authenticating') {
        logger.info('isAuthenticated: ', req.isAuthenticated());
        
        if (req.isAuthenticated()) {
            return res.send({ users:[removePassword(req.user)] });
        } else {
            return res.send({ users: [] } );    
        }
    } 

    else if (req.query.operation === 'following') {
        logger.info('GET /users/ req.query.operation = following - req.query.curUser: ', req.query.curUser);
        
        var emberArray = [];
        
        User.findOne({ id: req.query.curUser }, function (err, curUser) {
            if (err) return res.status(403).end();
            User.find({ id: { $in: curUser.following }}, function (err, following) {
                logger.info('Fn find() curUser.following - following: ', curUser.following);
                if (err) return res.status(403).end();
                //*** maybe use forEach ?
                following.forEach(function (follower) {
                    var u = removePassword(follower);
                    u = setIsFollowed(u, req.user);
                    emberArray.push(u);
                });
                
                return res.send({ users: emberArray });
            });
        });
    } 
    
    else if (req.query.operation === 'followers') {
        logger.info('Getting followers for: ', req.query.curUser);
        
        var emberArray = [];
        
        User.findOne({ id: req.query.curUser }, function (err, curUser) {
            if (err) return res.status(403).end();
            
            User.find({ id: { $in: curUser.followers }}, function (err, followers) {
                if (err) return res.status(403).end();

                followers.forEach(function (follower) {
                    var u = removePassword(follower);
                    u = setIsFollowed(u, req.user);
                    emberArray.push(u);
                });

                return res.send({ users: emberArray });
            });
        });
    } 

    else if (req.query.operation === 'logout') {
        logger.info('Logging Out');
        req.logout();
        // return res.status(200).end();
        return res.send({ users: {} } );    
    } 

    else {
        logger.info('find all users');
        User.find({}, function (err, users) {
            return res.send({ users: users } );    
        })
    }
});

/**
* This GET REQUEST is for specific users.
* Used for url username request. 
* Also for dashboard individual user-posts.
*/

router.get('/:user_id', function (req, res) {
    logger.info('GET REQUEST for individual user: ', req.params.user_id);

    User.findOne({ 'id': req.params.user_id }, function (err, user) {
        //if user is not found will return null. 

        if (err) { return res.status(500).end() };
        if(!user) { return res.status(404).end() };
        return res.send({ 'user': removePassword(user) });
    });
});

/**
* CREATE USER - new user record.
* POST is always used for creating a new record.
*/
router.post('/', function (req, res) {
    logger.info('CREATE USER - POST to api/users: ', req.body.user);

    if (req.body.user) {
        req.body.user.isFollowed = true;

        User.findOne({ id: req.body.user.id }, function (err, user) {
            if (user) {
                logger.debug('user already in db: ', req.body.user);
                return res.status(403).end();
            } else {
                logger.info('compare: ', req.body.user.id, user);

                User.create(req.body.user, function (err, user) {
                    if (err) return res.status(403).end();
                    logger.info('User Created: ', user.id);
                    req.login(req.body.user, function(err) {
                        logger.info('req.login');
                        if (err) { return res.status(500).end(); }
                        var u = removePassword(user);
                        return res.send({user: u});
                    });
                });    
            }
        });
    } else {
        logger.debug('signUp error: ', req.body.user);
        res.status(403).end();
    }
});

//api/user/follow
router.post('/follow', ensureAuthenticated, function (req, res) {
    logger.info('POST on api/follow: ',req.user, ' ', req.body);
    
    async.parallel({ 
        setFollowing: function(cb) {
            logger.info('setFollowing()');
            User.findOneAndUpdate( 
                { id: req.user.id },
                { $addToSet: { following: req.body.id }},
                //***** use addToset instead of push so you get unique posts in mongodb. 
                { safe: true, upsert: true },
                function (err, user) {
                    console.log(err);
                    return cb(null, {user: user});
                }
            );
        },
        setFollowers: function(cb) {
            logger.info('setFollowers()');
            User.findOneAndUpdate( 
                { id: req.body.id },
                { $addToSet: { followers: req.user.id }},
                { safe: true, upsert: true },
                function (err, user) {
                    console.log(err);
                    return cb(null, {user: user});
                }
            );
        }
    }, 
    function (err, results) {
        if(err) {return res.status(500).end();}
        return res.status(200).end();
    });
});

router.post('/unfollow', ensureAuthenticated, function (req, res) {
    logger.info('POST on api/unfollow: ',req.user, ' ', req.body);

    async.parallel({ 
        setFollowing: function(cb) {
            User.findOneAndUpdate( 
                { id: req.user.id },
                { $pull: { following: req.body.id }},
                { safe: true, upsert: true },
                function (err, user) {
                    console.log(err);
                    return cb(null, {user: user});
                }
            );
            
        },
        setFollowers: function(cb) {
            User.findOneAndUpdate( 
                { id: req.body.id },
                { $pull: { followers: req.user.id }},
                { safe: true, upsert: true },
                function (err, user) {
                    if (err) {
                        logger.error(err);
                    }
                    console.log(err);
                    return cb(null, {user: user});
                }
            );
            logger.info('setFollowers()');
            
        }
    }, 
    function (err, results) {
        if(err) {return res.status(500).end();}
        return res.status(200).end();
    });
});

router.get('/logout', function (req, res) {
    req.logout();
    return res.status(200).end();
});

function setIsFollowed (user, loggedInUser) {

    if (loggedInUser) {
        var userIsFollowing = loggedInUser.following.indexOf(user.id) !== -1 ? true : false;
        if (userIsFollowing) {
            user.isFollowed = true;
        } else {
            user.isFollowed = false;
        }
    }
    return user;
}

function removePassword (user) {
logger.info('fn removePassword user: ', user);
    var copy = {
        id: user.id,
        name: user.name,
        picture: '/assets/images/cristian-strat.png'
    };
    return copy;
}

function ensureAuthenticated (req, res, next) {
    logger.info('ensureAuthticated: ', req.isAuthenticated());
    if (req.isAuthenticated()) {
        logger.info('isAuthenticated');
        return next();
    } else {
        return res.status(403);
    }
}


module.exports = router;