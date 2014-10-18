var Mailgun = require('mailgun-js');
var mailConfig = require('../config').mailgun;
var mailgun = new Mailgun({
    apiKey: mailConfig.MAILGUN_API_KEY, 
    domain: mailConfig.MAILGUN_DOMAIN
});

module.exports = mailgun;