console.log('fbpassport loaded');
var logger = require('nlogger').logger(module);
var db = require('./../database/database');
var User = db.model('User');
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var bcrypt = require('bcrypt');
var userUtil = require('../router/routes/user/user-util');

passport.use(new FacebookStrategy({
    clientID: 1502806906656513,
    clientSecret: '1df958fb2ce68b476de8cb0ba3a5cd7b',
    callbackURL: "http://192.168.56.10/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    console.log('callback from facebook');
    // User.findOrCreate(..., function(err, user) {
    //   if (err) { return done(err); }
    //   done(null, user);
    // });

  }
));

module.exports = passport;