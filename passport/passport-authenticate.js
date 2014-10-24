var logger = require('nlogger').logger(module);
var db = require('./../database/database');
var User = db.model('User');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcrypt');
var userUtil = require('../router/routes/user/user-util');

passport.use(new LocalStrategy(
    function (username, password, done) {
        logger.info('fnc LocalStrategy - username: ', username);
        
        User.findOne({id: username}, function (err, user) {
            if (err) { 
                logger.info('FindOne returned error in local passport');
                logger.error(err);
                return done(err); 
            }
            if (!user) { 
                logger.warn('User is incorrect.');
                return done(null, false, { message: 'Incorrect username' } );
            }

            bcrypt.compare(password, user.password, function(err, res) {
                if (err) {
                    logger.error('Bcrypt password compare error: ', err);
                }
                if(res) {
                    logger.info('Bcrypt passed: ', res);
                    logger.info('local returning user: ', user.id);
                    return done(null, user);
                } else {
                    logger.warn('Bcrypt failed: ', 'query: ',password);
                    logger.warn( ' user.password: ', user.password);
                    return done(null, false, { message: 'Incorrect password.' } );
                }
            });
        });
    })
);

passport.serializeUser(function(user, done) {
    logger.info('Serialized user: ', user.id);
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    logger.info('Deserialized user: ', id);
    User.findOne({id: id}, function (err, user) {
        done(err, user);
    });
});

module.exports = passport;