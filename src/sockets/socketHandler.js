import {
    addUserToRoom,
    getUserById,
    removeUserFromRoom,
    getUsersInRoom,
} from '../utils/utils';

const socketHandler = (io) => {
    io.on('connection', (socket) => {
        console.log('We have a new socket connection');

        socket.on('joinRoom', ({ username, roomCode, roomName }, callback) => {
            const { error, user } = addUserToRoom({
                id: socket.id, username, roomCode, roomName,
            });

            if (error) {
                callback(error);
                return;
            }

            socket.join(user.roomCode);

            socket.emit('message', {
                message: `Welcome to the room ${user.username}`,
                user: 'Admin',
                type: 'message',
                roomCode: user.roomCode,
            });

            socket.broadcast.to(user.roomCode).emit('message', {
                message: `${user.username} has joined the room`,
                user: 'Admin',
                type: 'message',
                roomCode: user.roomCode,
            });

            io.to(user.roomCode).emit('roomData', {
                roomUsers: getUsersInRoom(user.roomCode),
                roomName: user.roomName,
            });

            callback();
        });

        socket.on('sendMessage', (message) => {
            const user = getUserById(socket.id);

            io.to(user.roomCode).emit('message', message);
        });

        socket.on('disconnect', () => {
            const user = removeUserFromRoom(socket.id);

            if (user) {
                io.to(user.roomCode).emit('message', {
                    message: `${user.username} has left the room`,
                    user: 'Admin',
                    type: 'message',
                    roomCode: user.roomCode,
                });

                io.to(user.roomCode).emit('roomData', {
                    roomUsers: getUsersInRoom(user.roomCode),
                });
            }
        });
    });
};

module.exports = socketHandler;
