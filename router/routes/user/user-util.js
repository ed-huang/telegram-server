var bcrypt = require('bcrypt');
var logger = require('nlogger').logger(module);
logger.info('loaded user-util');
// module.exports = {


//     setIsFollowed: function (user, loggedInUser) {

//         if (loggedInUser) {
//             var userIsFollowing = loggedInUser.following.indexOf(user.id) !== -1 ? true : false;
//             if (userIsFollowing) {
//                 user.isFollowed = true;
//             } else {
//                 user.isFollowed = false;
//             }
//         }
//         return user;
//     },

//     // removePassword: function (user, loggedInUser) {
//     removePassword: function (user) {
//     logger.info('fn user-util removePassword user: ', user);
//         var copy = {
//             id: user.id,
//             name: user.name,
//             picture: '/assets/images/cristian-strat.png',
//             //don't need to send follower and following
//             followers: user.followers.slice(),
//             following: user.following.slice()
//         };
//         return setIsFollowed(copy, loggedInUser);
//     },

//     ensureAuthenticated: function (req, res, next) {
//         logger.info('ensureAuthticated: ', req.isAuthenticated());
//         if (req.isAuthenticated()) {
//             logger.info('isAuthenticated');
//             return next();
//         } else {
//             return res.status(403);
//         }
//     }
// }

var userUtil  = exports;

userUtil.setIsFollowed = function (user, loggedInUser) {

    if (loggedInUser) {
        var userIsFollowing = loggedInUser.following.indexOf(user.id) !== -1 ? true : false;
        if (user === loggedInUser || userIsFollowing) {
            user.isFollowed = true;
        } else {
            user.isFollowed = false;
        }
    }
    return user;
};


// userUtil.removePassword = function (user, loggedInUser) {
// logger.info('fn user-util removePassword user: ', user);
//     var copy = {
//         id: user.id,
//         name: user.name,
//         picture: '/assets/images/christian-strat.png'

//     };
//     return userUtil.setIsFollowed(copy, loggedInUser);
// };

userUtil.createClientUser = function (user, loggedInUser) {
logger.info('fn user-util createClientUser user: ', user);
    var copyUser = user || loggedInUser;
    if(copyUser) {
        var copy = {
            id: copyUser.id,
            name: copyUser.name,
            picture: '/assets/images/christian-strat.png'
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
    bcrypt.genSalt(10, function(err, salt) {
        logger.info('bcrypt: ', salt);
        bcrypt.hash(savedPassword, salt, function(err, hash) {
            logger.info('savedPassword: ', hash);
            if(err) return res.status(403).end();
            return cb(err, hash);
        });
    });
};


userUtil.setFollowing = function (user, follower, cb) {
    //set followers
    //return cb(null, {user: user});
}