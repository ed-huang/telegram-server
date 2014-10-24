var config = require('../config').mailgun;
var fs = require('fs');
var Handlebars = require('handlebars');
var logger = require('nlogger').logger(module);
var Mailgun = require('mailgun-js');

var myMailgun = new Mailgun({
    apiKey: config.MAILGUN_API_KEY, 
    domain: config.MAILGUN_DOMAIN
});

var mailgun = exports;

mailgun.sendNewPassword = function (email, newPassword, done) {
    
    fs.readFile('./mailgun/templates/reset.hbs', { encoding: 'utf8' }, function (err, content) {
        if (err) { throw err; }
        logger.info('sending new password');
        var template = Handlebars.compile(content);
        var message = template({newPassword: newPassword});
        var subject = "Hello From Tele-App";
        
        if (err) {
            logger.info(err);
        }
        var data = {
            from: config.MAILGUN_SENDER_EMAIL,
            to: email,
            subject: subject,
            html: message
        }
       
        myMailgun.messages().send(data, function (err, body) {
            if (err) {
                logger.error("Something wrong with mailgun send: ", err);
                return done(err);
            }
            else {
                logger.info('body: ', body);
                return done(null);
            }
        });
    });
}




