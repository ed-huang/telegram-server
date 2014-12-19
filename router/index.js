console.log('index.js');
module.exports = function(app, io) {
    app.use('/api/users', require('./routes/user/user-routes'));
    app.use('/api/posts', require('./routes/post/post-routes'));
    // require('./routes/socket/socket-routes')(app, io);
};