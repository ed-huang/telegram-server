console.log('socket routes');
var logger = require('nlogger').logger(module);
var userUtil = require('../user/user-util');
var router = require('express').Router();
//var io = require("socket.io")(server);

/**
* Requesting sockets from the Sockets Stream 
* dashboard GET()
*/

// router.get('/', function (req, res) {
//     logger.info('GET on /chat');
//     console.log('chat app gotten chat');
//     res.sendFile(__dirname + '/chat.html');
// });


// module.exports = router;

module.exports = function(app, io) {
    app.get('/chat', userUtil.ensureAuthenticated, function (req, res) {
        logger.info('GET on /chat');
        console.log('chat app gotten chat');
        // res.sendFile(__dirname + '/chat.html');
    });

    // io.on('connection', function(socket) {
    //     console.log('a user connected!!!');
    //     socket.on('chat message', function (msg) {
    //         console.log('message: ' + msg);
    //         io.emit('chat message', msg);
    //     });
    // });

    
};