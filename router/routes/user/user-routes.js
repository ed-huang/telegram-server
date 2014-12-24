var async = require('async');
var db = require('../../../database/database.js');
var fs = require('fs');
var logger = require('nlogger').logger(module);
var mailgun = require('../../../mailgun/mailgun-mailserver');
var md5 = require('MD5');
var passport = require('../../../passport/passport-authenticate');
var passportFB = require('../../../passport/passport-facebook');
var passwordGenerator = require('password-generator');
var router = require('express').Router();
var userUtil = require('./user-util');

var User = db.model('User');

router.get('/', function(req, res) {
    logger.info('GET users route index');
    var operation = req.query.operation;
    
    switch (operation) {
    case 'authenticating':
        handleAuthenticatingRequest(req, res);
        break;
    case 'followers':
        handleFollowersRequest(req, res);
        break;
    case 'following':
        handleFollowingRequest(req, res);
        break;
    case 'login':
        handleLoginRequest(req, res);
        break;
    case 'facebookLogin':
        handleFacebookLogin(req, res);
        break;
    case 'logout':
        handleLogoutRequest(req, res);
        break;
    case 'reset':
        handleResetRequest(req, res);
        break;
    default:
        logger.info('find all users');
        User.find({}, function (err, users) {
            if (err) {
                logger.error('Unable to find user: ', err);    
            }
            
            return res.send({ users: users } );    
        });
        break;
    }
});

router.get('/:user_id', function (req, res) {
    logger.info('GET REQUEST for individual user: ', req.params.user_id);

    User.findOne({ 'id': req.params.user_id }, function (err, user) {
        if (err) {
            logger.error('Unable to find user: ', err);
            return res.status(500).end();
        }
            
        if(!user) { 
            logger.error('User params error.');
            return res.status(404).end() 
        };
        return res.send({ 'user': userUtil.createClientUser(user, req.user) });
    });
});

router.get('/logout', function (req, res) {
    req.logout();
    return res.status(200).end();
});

router.get('/auth/facebook', passport.authenticate('facebook'));

router.get('/auth/facebook/callback', function(req, res) {
    logger.info('Getting auth/facebook');
    passport.authenticate('facebook', { successRedirect: '/', failureRedirect: '/login' });
    res.status(200).end();
});

router.post('/', function (req, res) {
    logger.info('CREATE USER - POST to api/users: ', req.body.id);
    if (req.body.user) {

        User.findOne({ id: req.body.user.id }, function (err, user) {
            if (err) logger.error('Unable to findOne: ', err);
            if (user) {
                logger.warn('user already in db: ', req.body.user.id);
                return res.status(403).end();
            } else {
                logger.info('User not found: ', req.body.user.id);
                var password = req.body.user.password;
                async.waterfall([
                    function (cb) {
                        userUtil.encryptPassword(password, function(err, encryptedPassword) {
                            if (err) {
                                logger.error('Password wrong: ', password);
                                logger.error('Unable to encrypt: ', err);
                                cb(403);
                            } 
                            req.body.user.password = encryptedPassword;
                            req.body.user.picture = userUtil.assignAvatar();

                            cb(null, req.body.user);
                        });
                    },
                    function (user, cb) {
                        User.create(user, function (err, user) {
                            if (err) {
                                logger.error('User not Created', err);
                                cb(403);
                            }
                            logger.info('User Created: ', user.id);
                            req.login(user, function(err) {
                                if (err) {
                                    logger.error('Unable to login', err);
                                    logger.error('User: ', req.body.user);
                                    cb(500); 
                                }
                                logger.info('successfully logged in');
                                var newUser = userUtil.createClientUser(user, req.user);
                                cb(null, newUser);
                                
                            });
                        });
                    }
                ], 
                function (err, newUser) {
                    if (err) {
                        logger.error('Waterfall fail.', err);
                        return res.status(err).end();
                    }
                    return res.send({user: newUser});
                });
            }
        });
    } else {
        logger.debug('signUp error: ', req.body.user);
        res.status(403).end();
    }
});

router.post('/follow', userUtil.ensureAuthenticated, function (req, res) {
    logger.info('ROUTE - Make user ',req.user.id, ' follow user ', req.body.id);

    async.parallel({ 
        loggedInUser: function(cb) {
            var loggedInUser = req.user.id;
            var userToFollow = req.body.id;
            startFollowing(loggedInUser, userToFollow, cb);
        },

        currentUserToFollow: function(cb) {
            var loggedInUser = req.user.id;
            var userBeingFollowed = req.body.id;
            addFollowers(userBeingFollowed, loggedInUser, cb);
        }
    },

    function (err, results) {
        if(err) {
            logger.info('error: ', err);
            res.status(500).end();
        }
        logger.info('results: ', results);
        res.status(200).send(results);
    }); 
});

router.post('/unfollow', userUtil.ensureAuthenticated, function (req, res) {
    logger.info('ROUTE Post Unfollow - logged in User ',req.user.id, ' req.body.id: ', req.body.id);
    
    async.parallel({
        loggedInUser: function(cb) {
            var loggedInUser = req.user.id;
            var userToStopFollowing = req.body.id;
            stopFollowing(loggedInUser, userToStopFollowing, cb);
        },

        stopFollowingCurrentUser: function(cb) {
            var loggedInUser = req.user.id;
            var userToStopFollowing = req.body.id;
            removeFollowers(userToStopFollowing, loggedInUser, cb);
        }
    },

    function (err, results) {
        if(err) {
            logger.info('error: ', err);
            return res.status(500).end();
        }
        logger.info('results: ', results);
        res.status(200).send(results);
    });
});

/*
** FUNCTION DEFINITIONS
*/

function addFollowers(userBeingFollowed, loggedInUser, cb) {
    User.findOneAndUpdate( 
        { id: userBeingFollowed },
        { $addToSet: { followers: loggedInUser }},
        { safe: true, upsert: true },
        function (err, user) {
            if (err) {
                logger.error("did not addToSet");
                return fnc(err);
            }
            cb(null, user.id);
        }
    );
}

function startFollowing(loggedInUser, userToFollow, cb) {
    User.findOneAndUpdate( 
        { id: loggedInUser },
        { $addToSet: { following: userToFollow }},
        //***** use addToset instead of push so you get unique posts in mongodb. 
        { safe: true, upsert: true },
        function (err, user) {
            if (err) {
                logger.error("did not addToSet");
                return fnc(err);
            }
            cb(null, user.id);
        }
    );
}

function removeFollowers(userToStopFollowing, loggedInUser, cb) {
    User.findOneAndUpdate( 
        { id: userToStopFollowing },
        { $pull: { followers: loggedInUser }},
        { safe: true, upsert: true },
        function (err, user) {
            if (err) {
                logger.error("Did not pull from Followers");
                return fnc(err);
            }
            cb(null, user.id);
        }
    );
}

function stopFollowing(loggedInUser, userToStopFollowing, cb) {
    User.findOneAndUpdate( 
        { id: loggedInUser },
        { $pull: { following: userToStopFollowing }},
        { safe: true, upsert: true },
        function (err, user) {
            if(err) {
                logger.error("Didn't not pull from Following");
                return fnc(err);
            }
            cb(null, user.id);
        }
    ); 
}

function handleAuthenticatingRequest (req, res) {
    logger.info('isAuthenticated: ', req.isAuthenticated());
    
    if (req.isAuthenticated()) {
        return res.send({ users:[req.user] });
    } else {
        return res.send({ users: [] } );    
    }
}

function handleFollowersRequest (req, res) {

    
    var emberArray = [];
    
    User.findOne({ id: req.query.curUser }, function (err, curUser) {
        if (err) return res.status(403).end();
        logger.info('Getting followers for: ', curUser.id);
        logger.info('followers: ', curUser.followers);
        User.find({ id: { $in: curUser.followers }}, function (err, followers) {
            if (err) return res.status(403).end();
            logger.info('follwers inside of User: ', followers);
            followers.forEach(function (follower) {
                logger.info('follower id: ', follower.id);
                var u = userUtil.createClientUser(follower, req.user);
                emberArray.push(u);
            });

            return res.send({ users: emberArray });
        });
    });
}

function handleFollowingRequest (req, res) {
    logger.info('GET users following current user: ', req.query.curUser);
    
    var emberArray = [];
    User.findOne({ id: req.query.curUser }, function (err, curUser) {
        if (err) return res.status(403).end();
        User.find({ id: { $in: curUser.following }}, function (err, following) {
            logger.info('Fn find() curUser.following - following: ', curUser.following);
            if (err) return res.status(403).end();

            following.forEach(function (follower) {
                var u = userUtil.createClientUser(follower, req.user);
                emberArray.push(u);
            });

            return res.send({ users: emberArray });
        });
    });
}

function handleLoginRequest (req, res) {
    logger.info('Handle Login: ', req.query.username);

    User.findOne({id: req.query.username}, function (err, user) {
        if (err) {
            logger.error('Login error, unable to findOne: ', err);
            return res.status(500).end();
        }

        if (user) {
            logger.info('Login user found.', user.id);
            passport.authenticate('local', function(err, user, info) {
                if (err) {
                    logger.error('Passport authenticate error in authenticating', err);
                    return res.status(500).end(); 
                } else {
                    logger.info("Passport authenticate - user.id: ", user.id);
                    req.logIn(user, function(err) {
                        if (err) { 
                            logger.error('Something wrong with res.login()', err);
                            logger.error('Strategy callback: ', info);
                            return res.status(500).end(); 
                        }
                        logger.info('LogIn Successful: ', user.id);
                        return res.send({ users: [ userUtil.createClientUser(user, req.user) ]} );
                    });
                }
                
            })(req, res);    
        } else {
            logger.warn('Login error. User not found.');
            return res.status(403).end();
        }
    });
}

function handleLogoutRequest(req, res) {
    logger.info('Logging Out');
    req.logout();
    return res.send({ users: {} });    
}

function handleResetRequest(req, res) {
    logger.info('Reset Password');

    var newPassword = passwordGenerator();
    var savedPassword = md5(newPassword + req.query.username);
    var messageTo = req.query.email;
    logger.info('Salt used: ', req.query.username);
    userUtil.encryptPassword(savedPassword, function (err, encryptedPassword) {
        if (err) {
            logger.error('Something wrong with userUtil.encryptedPassword');
            return res.status(403).end();
        }
        
        User.update({ id: req.query.username }, { $set: { password: encryptedPassword }}, function (err, user) {
            if (err) {
                logger.error('Unable to update user: ', err);
                return res.status(403).end();
            }
            logger.info('User Password Updated: ', user);
            mailgun.sendNewPassword(messageTo, newPassword, function (err) {
                if (err) {
                    logger.error('Did not send message: ', err);
                    return res.status(500).end();
                }
                logger.info('Sent new password.');
                return res.send({users: {}});
            });
        }); 
    });
}

module.exports = router;