var logger = require('nlogger').logger(module);
var db = require('./../database/database');
var User = db.model('User');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy(
    function (username, password, done) {
        logger.info('fnc LocalStrategy - username: ', username);
        
        User.findOne({id: username}, function (err, user) {
            if (err) { 
                logger.info('findOne returned error in local passport');
                return done(err); 
            }
            if (!user) { 
                logger.warn('User is incorrect.');
                return done(null, false, { message: 'Incorrect username' } );
            }
            if (user.password !== password) {
                logger.warn('Password is incorrect.');
                return done(null, false, { message: 'Incorrect password.' } );
            }
            logger.info('local returning user: ', user.id);
            return done(null, user);
        });
    })
);

passport.serializeUser(function(user, done) {
    logger.info('serialUser() - user: ', user);
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findOne({id: id}, function (err, user) {
        done(err, user);
    });
});

module.exports = passport;