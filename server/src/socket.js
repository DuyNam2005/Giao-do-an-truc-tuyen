const { Server } = require('socket.io');

require('dotenv').config();

let io;

function initSocket(server) {
    io = new Server(server, {
        cors: {
            origin: process.env.URL_CLIENT,
            credentials: true,
        },
    });

    io.on('connection', (socket) => {
        console.log('A user connected:', socket.id);

        socket.on('userConnected', (userId) => {
            console.log(`User ${userId} connected with socket ID: ${socket.id}`);
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });

    return io;
}

function getIO() {
    if (!io) throw new Error('Socket.io chưa được khởi tạo!');
    return io;
}

module.exports = { initSocket, getIO };
