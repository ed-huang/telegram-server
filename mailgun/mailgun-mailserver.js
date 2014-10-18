var Mailgun = require('mailgun-js');
var mailConfig = require('../config');
var mailgun = new Mailgun({
    apiKey: mailConfig.MAILGUN_API_KEY, 
    domain: mailConfig.MAILGUN_DOMAIN
});

module.exports = mailgun;