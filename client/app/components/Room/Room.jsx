import React, { Component } from 'react';
import { history } from '../../helpers';
import { onConnect, getUserList, updateUserStatus, updateLeader, onStartGame, waitGameToStart } from '../../utils/socket'

import {
    Col,
    Row,
    Container,
} from 'reactstrap'

class Room extends Component {
    constructor(props) {
        super(props);
        this.state = {
            id: null,
            room: null,
            name: null,
            status: false,
            leader: false,
            users: []
        }
        getUserList((users) => {
            this.setState({ users }, () => {
                const { room, name } = this.state;
                let thisUser = users.find((user) => user.name === name && user.room === room)
                if (thisUser) {
                    this.setState({ leader: thisUser.leader ? true : false, id: thisUser.id });
                }
            });
            // if (users.every((currentValue) => (currentValue.isGameStart === true))) {
            //     const { room, name, leader } = this.state;
            //     var params = this.props.location.state;
            //     if (!params || !params.name || !params.room) {
            //         history.push('/');
            //     } else {
            //         history.push(`/${room}/ingame`, { room, name, leader, users });
            //     }
            // }
        });

        this.onReady = this.onReady.bind(this);
        this.onStartGame = this.onStartGame.bind(this);
    }

    componentDidMount() {
        var params = this.props.location.state;
        if (!params || !params.name || !params.room) {
            history.push('/');
        } else {
            this.setState({ name: params.name, room: params.room });
            onConnect(params);
            waitGameToStart(() => {
                const { room, name, leader, users } = this.state;
                history.push(`/${room}/ingame`, { room, name, leader, users });
            });
        }
    }

    getUserList() {
        const { users } = this.state;
        return (
            <Row>
                {
                    users.map((user, ind) => (
                        <Col sm={6} style={{ paddingBottom: 5 }} key={ind} >
                            <div className={user.status ? "outline success" : "outline secondary"}>
                                {user.name} {user.status && !user.leader ? '✔️' : ''} {user.leader ? '👑' : ''}
                            </div>
                        </Col>
                    ))
                }
            </Row>
        );
    }

    onReady() {
        this.setState({ status: !this.state.status }, () => {
            const { room, name, status } = this.state;
            updateUserStatus({ room, name, status });
        });
    }

    onStartGame() {
        var params = this.props.location.state;
        if (!params || !params.name || !params.room) {
            history.push('/');
        } else {
            onStartGame(params);
        }
    }

    isStartAvailable() {
        const { users, id } = this.state;
        // is all ready exlude leader
        let filterOtherUser = users.filter((user) => (user.id !== id));

        if (filterOtherUser.length > 0 && users.length > 4 && users.length < 11) {
            return !filterOtherUser.every((currentValue) => currentValue.status === true);
        }
        return true
    }

    render() {
        const { status, leader, users } = this.state;
        return (
            <div className="centered-form">
                <div className="centered-form__bigger_form">
                    <div className="form-field">
                        <Container fluid>
                            {this.getUserList()}
                        </Container>
                    </div>
                    <div className="form-field">
                        {
                            leader ?
                                <button onClick={this.onStartGame} className="custom_button" disabled={this.isStartAvailable()}>Start Game</button> :
                                <button onClick={this.onReady} className="custom_button">{status ? "Unready" : "Ready"}</button>
                        }
                    </div>
                </div>
            </div>
        );
    }
}

export default Room;