var logger = require('nlogger').logger(module);

module.exports = function (app) {
    logger.info('router index module loading');
    
    

    app.use('/api/users', require('./routes/user/user-routes'));
    app.use('/api/posts', require('./routes/post/post-routes'));
    
};