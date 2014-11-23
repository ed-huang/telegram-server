var avatars = require('../../../config').avatars;
var bcrypt = require('bcrypt');
var logger = require('nlogger').logger(module);
var userUtil  = exports;

userUtil.setIsFollowed = function (user, loggedInUser) {
    logger.info('setIsFollowed: ', user.id);
    logger.info('loggedInUser: ', loggedInUser.id);

    if (loggedInUser) {
        
        var userIsFollowing = loggedInUser.following.indexOf(user.id) !== -1 
            ? true 
            : false;
        
        logger.info('The loggedin user is following user \'' + user.id + '\': ', userIsFollowing);
        
        user.isFollowed = userIsFollowing
            ? true 
            : false;
    } 
    return user;    
};

userUtil.createClientUser = function (user, loggedInUser) {
    logger.info('Creating Client User: ', user.id);

    var copy = {
        id: user.id,
        name: user.name,
        picture: user.picture,
        isFollowing: true
    }; 
    if (loggedInUser) {
        return userUtil.setIsFollowed(copy, loggedInUser);
    } else {
        return copy;
    }
    
};

userUtil.ensureAuthenticated = function (req, res, next) {
    logger.info('ensureAuthticated: ', req.isAuthenticated());
    
    if (req.isAuthenticated()) {
        logger.info('isAuthenticated');
        return next();
    } else {
        return res.status(403);
    }
};

userUtil.encryptPassword = function (savedPassword, cb) {
    logger.info('encryptPassword: ', savedPassword);
    
    bcrypt.genSalt(10, function(err, salt) {
        if (err) {
            logger.error('genSalt: ', err);
        }
        logger.info('bcrypt: ', salt);
        bcrypt.hash(savedPassword, salt, function(err, hash) {
            if (err) {
                logger.error('Hash Problem: ', err);
                return res.status(403).end();
            }
            logger.info('Hashed Password: ', hash);
            return cb(err, hash);
        });
    });
};

userUtil.assignAvatar = function () {
    var key = Math.floor(Math.random() * avatars.length);
    var image = '/assets/images/avatars/' + avatars[key];
    return image;
}