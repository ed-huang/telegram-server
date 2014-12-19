console.log('config.js loaded');
module.exports.DATABASE_NAME = 'test';
module.exports.HOST_NAME = 'localhost';
var mailgun = {
    MAILGUN_SENDER_EMAIL: 'ed@edhuang.com',
    MAILGUN_API_KEY: 'key-b6ea8386c4d7bc95a3129bf21c000963',
    MAILGUN_DOMAIN: 'sandboxe121af1225264126bd720fce94a29d5c.mailgun.org'
}

var avatars = ['avatar-yellow.png', 'avatar-orange.png', 'avatar-blue.png', 'avatar-green.png', 'avatar-red.png'];

module.exports.mailgun = mailgun;
module.exports.avatars = avatars;