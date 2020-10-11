const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const path = require('path');
const webpack = require('webpack');
const bodyParser = require('body-parser');
const webpackConfig = require('./webpack.config');

const historyApiFallback = require('connect-history-api-fallback');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');

const socketIO = require('socket.io');

const { isRealString } = require('./utils/validation');
const { Users } = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

var users = new Users();

mongoose.connect('mongodb://localhost:27017/steamdb', { useNewUrlParser: true })
    .then(() => console.log("Conected to mongodb"))
    .catch(() => console.log("Error to connected"));
mongoose.Promise = global.Promise;

app.set('port', process.env.PORT || 3001);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const compiler = webpack(webpackConfig);

app.use(historyApiFallback({
    verbose: false
}));

//-------------------------------------------------------//
app.use(webpackDevMiddleware(compiler, {
    publicPath: webpackConfig.output.publicPath,
    contentBase: path.resolve(__dirname, 'client/public'),
    stats: {
        colors: true,
        hash: false,
        timings: true,
        chunks: false,
        chunkModules: false,
        modules: false
    }
}));

app.use(webpackHotMiddleware(compiler));
app.use(express.static(path.resolve(__dirname, '../dist')));
//-------------------------------------------------------//

const GAME_STATE = {
    INIT_STATE: "initState",
    SEND_MISSION: "sendMission",
    VOTE: "vote",
    MISSION: "mission",
    MISSION_SUCCESS: "missionSuccess",
    MISSION_FAIL: "missionFail",
    UPDATE: "update",
    FIND_MERLIN: "findMerlin",
    BAD_WIN: "badWin",
    GOOD_WIN: "goodWin"
}

const questSetupTable = [
    { players: 5, questMember: [2, 3, 2, 3, 3], twoFail: false },
    { players: 6, questMember: [2, 3, 4, 3, 4], twoFail: false },
    { players: 7, questMember: [2, 3, 3, 4, 4], twoFail: true },
    { players: 8, questMember: [3, 4, 4, 5, 5], twoFail: true },
    { players: 9, questMember: [3, 4, 4, 5, 5], twoFail: true },
    { players: 10, questMember: [3, 4, 4, 5, 5], twoFail: true }
];

let teamSetupTable = [
    { players: 5, good: 3, evil: 2 },
    { players: 6, good: 4, evil: 2 },
    { players: 7, good: 4, evil: 3 },
    { players: 8, good: 5, evil: 3 },
    { players: 9, good: 6, evil: 3 },
    { players: 10, good: 6, evil: 4 },
];

io.on('connection', (socket) => {
    console.log('New User Connected.');

    socket.on('join', (params, callback) => {
        if (!isRealString(params.name) || !isRealString(params.room)) {
            return callback('Name and room name are required');
        }

        socket.join(params.room);
        users.removeUser(socket.id);
        users.addUser(socket.id, params.name, params.room);

        io.to(params.room).emit('updateUserList', users.getUserList(params.room));

        callback();
    })

    socket.on('updateStatus', (params) => {
        // console.log("server", params);
        users.setUserStatus(socket.id, params.status);

        io.to(params.room).emit('updateUserList', users.getUserList(params.room));
    });

    socket.on('updateLeader', (params) => {
        users.setLeader(socket.id, params.leader);
        io.to(params.room).emit('updateUserList', users.getUserList(params.room));
    });

    socket.on('requestUserList', (params) => {
        io.to(params.room).emit('updateUserList', users.getUserList(params.room));
    });

    socket.on('startGame', (params, callback) => {
        const { room } = params;
        let usersInRoom = users.getUserList(room);
        let countUsers = usersInRoom.length;
        let qusetSetup = questSetupTable.find((table) => (table.players === countUsers));

        users.changeRoomInfo(room, {
            field: 'questMember',
            value: qusetSetup.questMember
        });

        users.changeRoomInfo(room, {
            field: 'twoFail',
            value: qusetSetup.twoFail
        });

        users.changeRoomInfo(room, {
            field: 'state',
            value: GAME_STATE.INIT_STATE
        });

        // teamSetupTable fix later

        if (countUsers < 5 || countUsers > 10) {
            return callback();
        }

        users.randomRole(usersInRoom, countUsers);
        io.to(room).emit('startGame', users.getUserList(room))
    });

    socket.on('gameState', (params, callback) => {
        let roomInfo;
        var failTime;
        var successTime;
        switch (params.state) {
            case "initState":
                users.changeRoomInfo(params.room, {
                    field: 'state',
                    value: GAME_STATE.SEND_MISSION
                });

                randomLeader(params.room);

                io.to(params.room).emit('gameState', {
                    state: GAME_STATE.INIT_STATE,
                    setState: GAME_STATE.SEND_MISSION,
                    roomInfo: users.getRoom(params.room),
                    type: 'initSetup'
                });

                break;
            case "sendMission":
                roomInfo = users.getRoom(params.room);
                let member = roomInfo.questMember[roomInfo.round];
                if (params.type === 'confirm') {
                    users.resetVote(params.room);
                    changeState(params.room, GAME_STATE.VOTE);
                } else {
                    updateTeamMemberList(params.team, member, params.room);
                }
                break;
            case "vote":
                if (params.type === 'vote') {
                    users.updateVote(params.id, params.vote);
                }

                let userList = users.getUserList(params.room);
                let filterNoVote = userList.filter(user => user.vote === null);

                if (filterNoVote.length - 1 === 0) {
                    let approve = userList.filter(user => user.vote === true).length;
                    let reject = userList.filter(user => user.vote === false).length;
                    if (reject >= approve) {
                        changeLeader(params.room);
                        sendNoti(params.room, 'reject');
                        changeState(params.room, GAME_STATE.SEND_MISSION);
                    } else if (approve > reject) {
                        sendNoti(params.room, 'approve');
                        changeState(params.room, GAME_STATE.MISSION);
                    }
                }

                updatePlayersList(params.room);
                break;
            case "mission":
                if (params.type === 'vote') {
                    roomInfo = users.getRoom(params.room);
                    let twoFail = roomInfo.twoFail;
                    var voteSuccess = roomInfo.voteSuccess;
                    var voteFail = roomInfo.voteFail;
                    failTime = roomInfo.failTime;
                    successTime = roomInfo.successTime;
                    if (params.vote) {
                        ++voteSuccess;
                        users.changeRoomInfo(params.room, { field: 'voteSuccess', value: voteSuccess });
                    } else {
                        ++voteFail;
                        users.changeRoomInfo(params.room, { field: 'voteFail', value: voteFail });
                    }

                    if (params.team && (voteSuccess + voteFail) === params.team.length) {
                        users.changeRoomInfo(params.room, { field: 'questRound', value: roomInfo.questRound++ });
                        var newState;
                        if (roomInfo.questRound === 4 && twoFail) {
                            if (voteFail >= 2) {
                                // Mission Fail
                                ++failTime;
                                newState = GAME_STATE.MISSION_FAIL;
                                users.changeRoomInfo(params.room, { field: 'failTime', value: failTime });
                            } else {
                                // Mission Success
                                ++successTime;
                                newState = GAME_STATE.MISSION_SUCCESS;
                                users.changeRoomInfo(params.room, { field: 'successTime', value: successTime });
                            }
                        } else {
                            if (voteFail >= 1) {
                                // Mission Fail
                                ++failTime;
                                newState = GAME_STATE.MISSION_FAIL;
                                users.changeRoomInfo(params.room, { field: 'failTime', value: failTime });
                            } else {
                                // Mission Success
                                ++successTime;
                                newState = GAME_STATE.MISSION_SUCCESS;
                                users.changeRoomInfo(params.room, { field: 'successTime', value: successTime });
                            }
                            changeLeader(params.room);
                        }

                        resetMissionVote(params.room);
                        increaseRound(params.room);
                        changeState(params.room, newState);
                    }
                }
                break;
            case "missionSuccess":
                roomInfo = users.getRoom(params.room);
                users.resetVote(params.room);
                successTime = roomInfo.successTime;

                if(successTime >= 3) {
                    changeState(params.room, GAME_STATE.FIND_MERLIN);
                } else {
                    changeState(params.room, GAME_STATE.SEND_MISSION);
                }

                updatePlayersList(params.room);
                break;
            case "missionFail":
                roomInfo = users.getRoom(params.room);
                users.resetVote(params.room);
                failTime = roomInfo.failTime;

                if(failTime >= 3) {
                    changeState(params.room, GAME_STATE.BAD_WIN);
                } else {
                    changeState(params.room, GAME_STATE.SEND_MISSION);
                }
                updatePlayersList(params.room);
                break;
            case "update":
                break;
            case "findMerlin":
                findMerlin(params);
                break;
            case "goodWin":
                break;
            case "badWin":
                break;
            case "restartGame":
                users.changeRoomInfo(params.room, {
                    field: 'state',
                    value: GAME_STATE.SEND_MISSION
                });

                let usersInRoom = users.getUserList(params.room);
                let countUsers = usersInRoom.length;
                users.randomRole(usersInRoom, countUsers);

                randomLeader(params.room);
                restartGame(params);

                io.to(params.room).emit('gameState', {
                    state: GAME_STATE.INIT_STATE,
                    setState: GAME_STATE.SEND_MISSION,
                    roomInfo: users.getRoom(params.room),
                    type: 'initSetup'
                });

                updatePlayersList(params.room);
                io.to(params.room).emit('updateUserList', users.getUserList(params.room));
                break;
        }
    })

    socket.on('selectTeam', (params) => {
        io.to(params.room).emit('selectTeam', params.team);
    });

    socket.on('disconnect', () => {
        var user = users.removeUser(socket.id);

        if (user) {
            users.removeRoom(user.room);
            io.to(user.room).emit('updateUserList', users.getUserList(user.room));
        }
    });

    function changeState(room, newState) {
        users.changeRoomInfo(room, { field: 'state', value: newState });
        io.to(room).emit('gameState', { state: newState, type: 'changeState' });
    }

    function updateTeamMemberList(team, member, room) {
        // let roomInfo = users.getRoom(params.room);
        io.to(room).emit('gameState', { state: GAME_STATE.SEND_MISSION, team: team, member: member, type: 'updateTeamMemberList' });
    }

    function updatePlayersList(room) {
        let userList = users.getUserList(room);
        io.to(room).emit('gameState', { type: 'updatePlayerList', users: userList });
    }

    function changeLeader(room) {
        users.setNewLeader(room);
        let userList = users.getUserList(room);
        io.to(room).emit('gameState', { type: 'updateLeader', users: userList });
    }
    
    function randomLeader(room) {
        users.randomLeader(room);
        let userList = users.getUserList(room);
        io.to(room).emit('gameState', { type: 'updateLeader', users: userList });
    }

    function increaseRound(room) {
        let roomInfo = users.getRoom(room);
        let round = ++roomInfo.questRound;
        users.changeRoomInfo(room, { field: 'questRound', value: round });
        io.to(room).emit('gameState', { type: 'updateRound', round: round });
    }

    function resetMissionVote(room) {
        users.changeRoomInfo(room, { field: 'voteSuccess', value: 0 });
        users.changeRoomInfo(room, { field: 'voteFail', value: 0 });
    }

    function sendNoti(room, name) {
        io.to(room).emit('gameState', { type: 'notification', name: name });
    }

    function findMerlin(params) {
        let userList = users.getUserList(params.room);
        let isMerlin = userList.find((user) => user.name === params.selectMerlin && user.role === "Merlin");
        if (isMerlin) {
            changeState(params.room, GAME_STATE.BAD_WIN);
        } else {
            changeState(params.room, GAME_STATE.GOOD_WIN);
        }
    }

    function restartGame(params) {
        users.changeRoomInfo(params.room, { field: 'questRound', value: 0 });
        users.changeRoomInfo(params.room, { field: 'voteSuccess', value: 0 });
        users.changeRoomInfo(params.room, { field: 'voteFail', value: 0 });
        users.changeRoomInfo(params.room, { field: 'successTime', value: 0 });
        users.changeRoomInfo(params.room, { field: 'failTime', value: 0 });
    }
});

server.listen(app.get('port'), () => {
    console.log(`listen to port ${app.get('port')}`);
});
