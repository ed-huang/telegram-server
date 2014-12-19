var io = require('socket.io');

module.exports = function(http) {
    io = io(http);

    io.on('connection', function(socket) {
        console.log("[NOTIFICATION] - New connection");
        io.sockets.emit("message", { message: "New connection" });
        socket.on("send", function(data) {
            io.sockets.emit("message", { message: data.message });
        });
    });
    return io;
}

