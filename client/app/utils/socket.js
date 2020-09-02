import io from 'socket.io-client';

const socket = io('http://localhost:3001');

socket.on('connect', (params) => {
    console.log('Connect to Server');
});

export const onConnect = (params) => {
    socket.emit('join', params, function (err) {
        if (err) {
            alert(err);
            window.location.href = '/'
        } else {
            console.log('No error');
        }
    });
}

export const getUserList = (callback) => {
    socket.on('updateUserList', (users) => {
        callback(users)
    });
}

export const requestUserList = (params) => {
    socket.emit('requestUserList', params, function (err) {
        if (err) {
            alert(err);
        } else {
            console.log('No error');
        }
    })
}

export const updateUserStatus = (params) => {
    socket.emit('updateStatus', params, function (err) {
        if (err) {
            alert(err);
        } else {
            console.log('No error');
        }
    });
}

export const updateLeader = (params) => {
    socket.emit('updateLeader', params, function (err) {
        if (err) {
            alert(err);
        } else {
            console.log('No error');
        }
    });
}

export const onStartGame = (params) => {
    socket.emit('startGame', params, function (err) {
        if (err) {
            alert(err);
        } else {
            console.log('No error');
        }
    });
}

export const waitGameToStart = (callback) => {
    socket.on('startGame', () => {
        callback()
    });
}