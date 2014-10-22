var bcrypt = require('bcrypt');
var logger = require('nlogger').logger(module);
var userUtil  = exports;

userUtil.setIsFollowed = function (user, loggedInUser) {
    logger.info('setIsFollowed: ', user);

    if (loggedInUser) {
        var userIsFollowing = loggedInUser.following.indexOf(user.id) !== -1 ? true : false;
        logger.info('userIsFollowing: ', userIsFollowing);
        if (user === loggedInUser || userIsFollowing) {
            user.isFollowed = true;
        } else {
            user.isFollowed = false;
        }
    }
    return user;
};

userUtil.setClientUser = function (user, loggedInUser) {
    logger.info('fn user-util setClientUser user: ', user.id);
    
    var copyUser = user || loggedInUser;
    if(copyUser) {
        var copy = {
            id: copyUser.id,
            name: copyUser.name,
            picture: copyUser.picture
        };
    }
    
    return userUtil.setIsFollowed(copy, loggedInUser);
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
        logger.info('bcrypt: ', salt);
        bcrypt.hash(savedPassword, salt, function(err, hash) {
            logger.info('savedPassword: ', hash);
            if(err) return res.status(403).end();
            return cb(err, hash);
        });
    });
};

userUtil.assignAvatar = function () {
    var avatars = ['avatar-yellow.png', 'avatar-orange.png', 'avatar-blue.png', 'avatar-green.png', 'avatar-red.png'];
    var key = Math.floor(Math.random() * avatars.length);
    var image = '/assets/images/avatars/' + avatars[key];
    return image;
}