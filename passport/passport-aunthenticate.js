var logger = require('nlogger').logger(module);
var db = require('./../database/database');
var User = db.model('User');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcrypt');

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

            bcrypt.compare(password, user.password, function(err, res) {
                if(res) {
                    logger.info('Bcrypt passed');
                    logger.info('local returning user: ', user.id);
                    return done(null, user);
                } else {
                    logger.info('Bcrypt failed: ', 'query: ',password, 'user: ', user.password);
                    logger.warn('Password is incorrect.');
                    return done(null, false, { message: 'Incorrect password.' } );
                }
            });
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