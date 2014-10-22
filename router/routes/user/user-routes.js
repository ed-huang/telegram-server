var async = require('async');
var db = require('../../../database/database.js');
var express = require('express');
var hb = require('handlebars');
var logger = require('nlogger').logger(module);
var mailgun = require('../../../mailgun/mailgun-mailserver');
var md5 = require('MD5');
var passport = require('../../../passport/passport-aunthenticate');
var passwordGenerator = require('password-generator');
var router = express.Router();
var User = db.model('User');
var userUtil = require('./user-util');

/**
* User LOGIN or get users. Used for following and follower stream
*/
router.get('/', function(req, res) {
    logger.info('GET /users/');
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
        case 'logout':
            handleLogoutRequest(req, res);
            break;
        case 'reset':
            handleResetRequest(req, res);
            break;
        default:
            logger.info('find all users');
            User.find({}, function (err, users) {
                return res.send({ users: users } );    
            });
            break;
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
        logger.info('Getting followers for: ', req.query.curUser);
        
        var emberArray = [];
        
        User.findOne({ id: req.query.curUser }, function (err, curUser) {
            if (err) return res.status(403).end();
            
            User.find({ id: { $in: curUser.followers }}, function (err, followers) {
                if (err) return res.status(403).end();

                followers.forEach(function (follower) {
                    var u = userUtil.createClientUser(follower, req.user);
                    // u = userUtil.setIsFollowed(u, req.user);
                    emberArray.push(u);
                });

                return res.send({ users: emberArray });
            });
        });
    }

    function handleFollowingRequest (req, res) {
        logger.info('GET /users/ req.query.operation = following - req.query.curUser: ', req.query.curUser);
        
        var emberArray = [];
        User.findOne({ id: req.query.curUser }, function (err, curUser) {
            if (err) return res.status(403).end();
            User.find({ id: { $in: curUser.following }}, function (err, following) {
                logger.info('Fn find() curUser.following - following: ', curUser.following);
                if (err) return res.status(403).end();
                //*** maybe use forEach ?
                following.forEach(function (follower) {
                    var u = userUtil.createClientUser(follower, req.user);
                    emberArray.push(u);
                });
                
                return res.send({ users: emberArray });
            });
        });

    }

    function handleLoginRequest (req, res) {
        logger.info('req.query.operation = login - username: ', req.query.username);

        User.findOne({id: req.query.username}, function (err, user) {
            var userQuery = req.query;
            logger.info('user password: ', user.password, 'query: ', userQuery.password);

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

                    return res.send({ users: [ userUtil.createClientUser(user, req.user) ]} );
                });
            })(req, res);
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
        // var salt = bcrypt.genSaltSync(10);
        // var hash = bcrypt.hashSync(savedPassword, salt);
        //bcrypt is slow, use async
        
        userUtil.encryptPassword(savedPassword, function (err, encryptedPassword) {
            if (err) return res.status(403).end();
            User.update({id: req.query.username}, { $set: {password: encryptedPassword }}, function (err, user) {
                if (err) return res.status(403).end();
                logger.info('User Updated: ', user);

                //var mailgun = new Mailgun({apiKey: api_key, domain: domain});
                //fs.readFile('./file', function(content) {
                //check documententation. utf-8

                //});

                var data = {
                //Specify email data
                  from: 'ed@edhuang.com',
                //The email to contact
                  to: req.query.email,
                //Subject and text data  
                  subject: 'Hello from Tele-APP',
                  html: '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">'+
                            '<html xmlns="http://www.w3.org/1999/xhtml">'+
                                '<body>'+
                                    '<p>Hey there,</p>' +
                                    '<p>Your new password is '+newPassword+'.</p>' +
                                    '<br/>' +
                                    '<p>All the best,</p>' +
                                    '<p>The Telegram App Team</p>' +
                                '</body>' +
                            '</html>'
                }

                mailgun.messages().send(data, function (err, body) {
                //If there is an error, render the error page
                    if (err) {
                        res.render('error', { error : err});
                        console.log("got an error: ", err);
                    }
                    //Else we can greet    and leave
                    else {
                        //Here "submitted.jade" is the view file for this landing page 
                        //We pass the variable "email" from the url parameter in an object rendered by Jade
                        return res.send({users: {} });
                    }
                });
            }); 
        });
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
        return res.send({ 'user': userUtil.createClientUser(user) });
    });
});

/**
* CREATE USER - new user record.
* POST is always used for creating a new record.
*/
router.post('/', function (req, res) {
    logger.info('CREATE USER - POST to api/users: ', req.body.user);

    if (req.body.user) {

        User.findOne({ id: req.body.user.id }, function (err, user) {
            if (user) {
                logger.debug('user already in db: ', userUtil.createClientUser(req.body.user));
                return res.status(403).end();
            } else {
                logger.info('compare: ', req.body.user.id, user);
                userUtil.encryptPassword(req.body.user.password, function(err, encryptedPassword) {
                   if(err) return res.status(403).end();
                    req.body.user.password = encryptedPassword;
                    req.body.user.picture = '/assets/images/christian-strat.png';
                    User.create(req.body.user, function (err, user) {
                        if (err) return res.status(403).end();
                        logger.info('User Created: ', user);
                        req.login(req.body.user, function(err) {
                            logger.info('req.login');
                            if (err) { return res.status(500).end(); }
                            var u = userUtil.createClientUser(user);
                            return res.send({user: u});
                        });
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
router.post('/follow', userUtil.ensureAuthenticated, function (req, res) {
    logger.info('POST on api/follow: ',req.user, ' ', req.body);

    function followUser (fnc, loggedInUser, userToFollow) {
        logger.info('setFollowing()');
        User.findOneAndUpdate( 
            { id: loggedInUser },
            { $addToSet: { following: userToFollow }},
            //***** use addToset instead of push so you get unique posts in mongodb. 
            { safe: true, upsert: true },
            function (err, user) {
                console.log(err);
                return fnc(null, {user: user});
            }
        );
    }

    function updateFollowersList (fnc, userBeingFollowed, loggedInUser) {
        logger.info('setFollowers()');
            User.findOneAndUpdate( 
                { id: userBeingFollowed },
                { $addToSet: { followers: loggedInUser }},
                { safe: true, upsert: true },
                function (err, user) {
                    console.log(err);
                    return fnc(null, {user: user});
                }
            );
    }
    
    async.parallel({ 
        setFollowing: function(cb) {
            var loggedInUser = req.user.id;
            var userToFollow = req.body.id;

            followUser(cb, loggedInUser, userToFollow);

        },
        setFollowers: function(cb) {
            var loggedInUser = req.user.id;
            var userBeingFollowed = req.body.id;
            
            updateFollowersList(cb, userBeingFollowed, loggedInUser);
        }
    },

    function (err, results) {
        if(err) {
            logger.info('error: ', err);
            return res.status(500).end();
        }
        logger.info('results: ', results);
        return res.status(200).end();
    }); 
});

router.post('/unfollow', userUtil.ensureAuthenticated, function (req, res) {
    logger.info('POST on api/unfollow logged in User ',req.user.id, ' req.body.id: ', req.body.id);

    function stopFollowing (fnc, loggedInUser, userToStopFollowing) {
        User.findOneAndUpdate( 
            { id: loggedInUser },
            { $pull: { following: userToStopFollowing }},
            { safe: true, upsert: true },
            function (err, user) {
                console.log(err);
                return fnc(null, {user: user});
            }
        );   
    }

    function updateFollowersList (fnc, userToStopFollowing, loggedInUser) {
        User.findOneAndUpdate( 
            { id: userToStopFollowing },
            { $pull: { followers: loggedInUser }},
            { safe: true, upsert: true },
            function (err, user) {
                console.log(err);
                return fnc(null, {user: user});
            }
        );   
    }

    async.parallel({
        setUnFollowing: function(cb) {
            var loggedInUser = req.user.id;
            var userToStopFollowing = req.body.id;

            stopFollowing(cb, loggedInUser, userToStopFollowing);
        },
        setRemoveFollower: function(cb) {
            var loggedInUser = req.user.id;
            var userToStopFollowing = req.body.id;

            updateFollowersList(cb, userToStopFollowing, loggedInUser);
        }
    }, 
    function (err, results) {
        if(err) {
            logger.info('error: ', err);
            return res.status(500).end();
        }
        return res.status(200).end();
    });


    
});

router.get('/logout', function (req, res) {
    req.logout();
    return res.status(200).end();
});


module.exports = router;