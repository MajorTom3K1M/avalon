const { shuffle } = require('./utils');

class Users {
    constructor() {
        this.users = [];
        this.rooms = [];
    }
    addUser(id, name, room) {
        var user = { id, name, room };
        if (this.users.length < 1) {
            user.leader = true;
        }
        this.rooms.push({ room, questRound: 0 });
        this.users.push(user);
        return user;
    }
    removeUser(id) {
        // return user that was removed
        var user = this.getUser(id);

        if (user) {
            this.users = this.users.filter((user) => user.id !== id);
        }

        return user;
    }
    getUser(id) {
        return this.users.filter((user) => user.id === id)[0];
    }
    getRoom(room) {
        return this.rooms.filter((filterRoom) => filterRoom.room === room)[0];
    }
    getUserList(room) {
        var users = this.users.filter((user) => user.room === room);
        // var usersList = users.map((user) => user.name);
        return users;
    }
    setUserStatus(id, status) {
        var user = this.getUser(id);
        user.status = status;

        this.users.forEach((inListUser, ind) => {
            if (inListUser.id === id) {
                this.users[ind] = user;
            }
        });
    }
    setLeader(id, leaderStatus) {
        var user = this.getUser(id);
        user.leader = leaderStatus;

        this.users.forEach((inListUser, ind) => {
            if (inListUser.id === id) {
                this.users[ind] = user;
            }
        });
    }
    randomRole(usersInRoom, countUsers, option = null) {
        let teamSetupTable = [
            { players: 5, good: 3, evil: 2 },
            { players: 6, good: 4, evil: 2 },
            { players: 7, good: 4, evil: 3 },
            { players: 8, good: 5, evil: 3 },
            { players: 9, good: 6, evil: 3 },
            { players: 10, good: 6, evil: 4 },
        ];

        let teamSetup = teamSetupTable.find((element) => element.players === countUsers);

        let availableGoodSpecialRole = ['Merlin'];
        let availableEvilSpecialRole = ['EvilLeader'];

        if (option) {
            // availableGoodSpecialRole = availableGoodSpecialRole.filter((role) => option.goodSpecial.includes(role));
            // availableEvilSpecialRole = availableGoodSpecialRole.filter((role) => option.evilSpecial.includes(role));
        }

        shuffle(usersInRoom);
        // --- assign good team ---- //
        usersInRoom.forEach((user, ind) => {
            if (ind < teamSetup.good) {
                if (ind < teamSetup.good - 1) {
                    this.changeUserInfo(user.id, { field: 'role', value: 'GoodTeam' });
                } else {
                    let randomSelectRole = Math.floor(Math.random() * availableGoodSpecialRole.length);
                    this.changeUserInfo(user.id, { field: 'role', value: availableGoodSpecialRole[randomSelectRole] });
                    availableGoodSpecialRole.splice(randomSelectRole, 1);
                }
            } else {
                if (ind < (teamSetup.good + teamSetup.evil) - 1) {
                    this.changeUserInfo(user.id, { field: 'role', value: 'EvilTeam' });
                } else {
                    let randomSelectRole = Math.floor(Math.random() * availableEvilSpecialRole.length);
                    this.changeUserInfo(user.id, { field: 'role', value: availableEvilSpecialRole[randomSelectRole] });
                    availableEvilSpecialRole.splice(randomSelectRole, 1);
                }
            }
            // this.changeUserInfo(user.id, { field: 'isGameStart', value: true });
        });
    }
    changeUserInfo(id, fieldValue) {
        let user = this.getUser(id);
        user[fieldValue.field] = fieldValue.value;

        this.users.forEach((inListUser, ind) => {
            if (inListUser.id === id) {
                this.users[ind] = user;
            }
        });
    }
    changeRoomInfo(room, fieldValue) {
        let newRoom = this.getRoom(room);
        newRoom[fieldValue.field] = fieldValue.value;

        this.rooms.forEach((inListRoom, ind) => {
            if (inListRoom.room === room) {
                this.rooms[ind] = newRoom;
            }
        });
    }
    resetVote(room) {
        let usersInRoom = this.getUserList(room);
        usersInRoom.forEach((user, ind) => {
            this.changeUserInfo(user.id, { field: 'vote', value: null });
        });
    }
    updateVote(id, value) {
        let user = this.getUser(id);
        this.changeUserInfo(user.id, { field: 'vote', value: value });
    }
}

module.exports = { Users };