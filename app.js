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
        console.log("server", params);
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

        if (countUsers < 5 || countUsers > 10) {
            return callback();
        }

        users.randomRole(usersInRoom, countUsers);
        // io.to(room).emit('updateUserList', users.getUserList(room));
        io.to(room).emit('startGame', users.getUserList(room));
    });

    socket.on('disconnect', () => {
        var user = users.removeUser(socket.id);

        if (user) {
            io.to(user.room).emit('updateUserList', users.getUserList(user.room));
        }
    });

});

server.listen(app.get('port'), () => {
    console.log(`listen to port ${app.get('port')}`);
});
