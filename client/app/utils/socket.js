import io from 'socket.io-client';

const socket = io('http://localhost:3001');

export const GAME_STATE = {
    INIT_STATE: "initState",
    SEND_MISSION: "sendMission",
    VOTE: "vote",
    MISSION: "mission",
    MISSION_SUCCESS: "missionSuccess",
    MISSION_FAIL: "missionFail",
    UPDATE: "update",
    FIND_MERLIN: "findMerlin",
    BAD_WIN: "badWin",
    GOOD_WIN: "goodWin",
    RESET: "restartGame"
}

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

export const selectTeam = (params) => {
    socket.emit('selectTeam', params, function (err) {
        if (err) {
            alert(err);
        } else {
            console.log('No error');
        }
    });
}

export const getSelectedTeam = (callback) => {
    socket.on('selectTeam', (selectTeam) => {
        callback(selectTeam);
    });
}

export const gameState = (callback) => {
    socket.on('gameState', (params) => {
        callback(params);
        // switch (state) {
        //     case "sendMission":
        //         break;
        //     case "":
        //         break;
        //     case "vote":
        //         break;
        //     case "mission":
        //         break;
        //     case "missionSuccess":
        //         break;
        //     case "missionFail":
        //         break;
        //     case "update":
        //         break;
        //     case "findMerlin":
        //         break;
        // }
    })
}

export const sendGameState = (params) => {
    socket.emit('gameState', params, function (err) {
        if (err) {
            // alert(err);
        } else {
            console.log('No error');
        }
    })
}

export const unsubscribeToGetUsers = () => {
    socket.removeListener('updateUserList');
}