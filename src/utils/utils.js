const users = [];

const addUserToRoom = ({
    id, username, roomCode, roomName,
}) => {
    // validate the data
    if (!username || !roomCode) {
        return {
            error: 'A username and a room code is required',
        };
    }

    // Check for existing user
    const existingUser = users.find(
        (user) => user.roomCode === roomCode && user.username === username,
    );
    if (existingUser) {
        return {
            error: 'A user with the same name already exists in the room',
        };
    }

    let roomNameFinal = roomName;

    if (roomName === null) {
        roomNameFinal = users.find((user) => user.roomCode === roomCode).roomName;
    }

    const user = {
        id, username, roomName: roomNameFinal, roomCode,
    };

    users.push(user);

    return { user };
};

const getUserById = (id) => {
    const user = users.find((indUser) => indUser.id === id);
    return user;
};

const removeUserFromRoom = (id) => {
    const index = users.findIndex((user) => user.id === id);
    if (index !== -1) {
        return users.splice(index, 1)[0];
    }
    return null;
};

const getUsersInRoom = (roomCode) => {
    const usersInRoom = users.filter((user) => user.roomCode === roomCode);
    return usersInRoom;
};

module.exports = {
    addUserToRoom,
    getUserById,
    removeUserFromRoom,
    getUsersInRoom,
};
