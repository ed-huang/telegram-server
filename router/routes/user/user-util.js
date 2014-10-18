var logger = require('nlogger').logger(module);
logger.info('loaded user-util');
module.exports = {


    setIsFollowed: function (user, loggedInUser) {

        if (loggedInUser) {
            var userIsFollowing = loggedInUser.following.indexOf(user.id) !== -1 ? true : false;
            if (userIsFollowing) {
                user.isFollowed = true;
            } else {
                user.isFollowed = false;
            }
        }
        return user;
    },

    removePassword: function (user) {
    logger.info('fn user-util removePassword user: ', user);
        var copy = {
            id: user.id,
            name: user.name,
            picture: '/assets/images/cristian-strat.png',
            followers: user.followers.slice(),
            following: user.following.slice()
        };
        return copy;
    },

    ensureAuthenticated: function (req, res, next) {
        logger.info('ensureAuthticated: ', req.isAuthenticated());
        if (req.isAuthenticated()) {
            logger.info('isAuthenticated');
            return next();
        } else {
            return res.status(403);
        }
    }
}