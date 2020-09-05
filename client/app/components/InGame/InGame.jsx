import React from 'react';
import {
    getUserList, requestUserList,
    unsubscribeToGetUsers, sendGameState,
    gameState, GAME_STATE
} from '../../utils/socket';
import { history } from '../../helpers';

import SelectTeam from './SelectTeam.jsx';

import {
    Col,
    Row,
    Container,
    Input
} from 'reactstrap';

class InGame extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            id: null,
            room: null,
            name: null,
            status: false,
            leader: false,
            role: '',
            gameState: '',
            questRound: 0,
            questMember: [],
            team: [],
            users: [],
            score: { evilWin: 0, goodWin: 0 }
        }
        getUserList((users) => {
            this.setState({ users }, () => {
                const { room, name } = this.state;
                let thisUser = users.find((user) => user.name === name && user.room === room)
                if (thisUser) {
                    this.setState({ leader: thisUser.leader ? true : false, id: thisUser.id, role: thisUser.role ? thisUser.role : '', id: thisUser.id });
                }
            });
            console.log(users)
        });

        this.handleCheckbox = this.handleCheckbox.bind(this);
    }

    componentDidMount() {
        let params = this.props.location.state;
        if (!params || !params.name || !params.room) {
            history.push('/');
        } else {
            this.setState({ name: params.name, room: params.room, leader: params.leader ? params.leader : false });
            requestUserList(params);
            sendGameState({ state: GAME_STATE.INIT_STATE, room: params.room });
        }
        gameState((gameStateParams) => {
            console.log("GET GAME STATE", gameStateParams);
            let { score } = this.state;
            let newScoreObj = score;
            switch (gameStateParams.state) {
                case GAME_STATE.INIT_STATE:
                    // console.log("INIT STATE", gameStateParams);
                    this.setState({
                        gameState: gameStateParams.setState,
                        questRound: gameStateParams.roomInfo.questRound,
                        questMember: gameStateParams.roomInfo.questMember
                    });
                    break;
                case GAME_STATE.SEND_MISSION:
                    if (gameStateParams.type === "updateTeamMemberList") {
                        if (this.state.team.length <= this.state.questMember[this.state.questRound]) {
                            this.setState({ team: gameStateParams.team });
                        }
                    }
                    break;
                case GAME_STATE.VOTE:
                    break;
                case GAME_STATE.MISSION_SUCCESS:
                    console.log("MISSION SUCCESS");
                    newScoreObj.goodWin++;
                    this.setState({ score: newScoreObj });
                    break;
                case GAME_STATE.MISSION_FAIL:
                    console.log("MISSION FAIL");
                    newScoreObj.evilWin++;
                    this.setState({ score: newScoreObj });
                    break;
            }

            if (gameStateParams.type === 'changeState') {
                this.setState({ gameState: gameStateParams.state }, () => {
                    console.log(this.state);
                });
            }
            if (gameStateParams.type === 'updatePlayerList') {
                this.setState({ users: gameStateParams.users });
            }
            if (gameStateParams.type === 'updateLeader') {
                let thisUser = gameStateParams.users.find((user) => (user.id === this.state.id));
                this.setState({ leader: thisUser.leader ? true : false, team: [] });
            }
        })
    }

    componentWillUnmount() {
        unsubscribeToGetUsers();
    }

    handleCheckbox(e) {
        const { team } = this.state;
        if (e.currentTarget.checked) {
            let joined = team.concat(e.currentTarget.value);
            if (joined.length <= this.state.questMember[this.state.questRound]) {
                this.setState({ team: joined }, () => {
                    let params = { state: this.state.gameState, team: this.state.team, room: this.state.room }
                    sendGameState(params);
                });
            } else {
                alert(`ในรอบที่ ${this.state.questRound + 1} ต้องมีสมาชิกออกไปทำภาระกิจ ${this.state.questMember[this.state.questRound]} คน`);
            }
        } else {
            this.setState({ team: team.filter((name) => name !== e.currentTarget.value) }, () => {
                let params = { state: this.state.gameState, team: this.state.team, room: this.state.room }
                sendGameState(params);
            });
        }
    }

    getUserList() {
        const { users, role, leader, gameState, team } = this.state;
        // Merlin can't see EvilLeader see EvilTeam
        if (role.toLowerCase() === 'merlin') {
            return (
                <Row>
                    {
                        users.map((user, ind) => (
                            <Col sm={6} style={{ paddingBottom: 5 }} key={ind} >
                                <div className={user.role?.toLowerCase() === 'evilteam' ? "outline danger" : "outline secondary"}>
                                    {user.name} {user.role?.toLowerCase() === 'evilteam' ? '😈' : ''} {user.leader ? '👑' : ''}
                                    {
                                        gameState === GAME_STATE.SEND_MISSION && leader ?
                                            <span className="float-right align-middle justify-content-center">
                                                <input onChange={this.handleCheckbox} value={user.name} checked={team.includes(user.name)} type="checkbox" />{' '}
                                            </span> : null
                                    }
                                </div>
                            </Col>
                        ))
                    }
                </Row>
            );
            // EvilTeam is Just a EvilTeam that can see EvilTeam
        } else if (role.toLowerCase() === 'evilteam' || role.toLowerCase() === 'evilleader') {
            return (
                <Row>
                    {
                        users.map((user, ind) => (
                            <Col sm={6} style={{ paddingBottom: 5 }} key={ind} >
                                <div className={user.role?.toLowerCase() === 'evilteam' || user.role.toLowerCase() === 'evilleader' ? "outline danger" : "outline secondary"}>
                                    {user.name} {user.role?.toLowerCase() === 'evilteam' || user.role.toLowerCase() === 'evilleader' ? '😈' : ''} {user.leader ? '👑' : ''}
                                    {
                                        gameState === GAME_STATE.SEND_MISSION && leader ?
                                            <span className="float-right align-middle justify-content-center">
                                                <input onChange={this.handleCheckbox} value={user.name} checked={team.includes(user.name)} type="checkbox" />{' '}
                                            </span> : null
                                    }
                                </div>
                            </Col>
                        ))
                    }
                </Row>
            );
            // GoodTeam is Just a Good Team
        } else {
            return (
                <Row>
                    {
                        users.map((user, ind) => (
                            <Col sm={6} style={{ paddingBottom: 5 }} key={ind} >
                                <div className={"outline secondary"}>
                                    {user.name} {user.leader ? '👑' : ''}
                                    {
                                        gameState === GAME_STATE.SEND_MISSION && leader ?
                                            <span className="float-right align-middle justify-content-center">
                                                <input onChange={this.handleCheckbox} value={user.name} checked={team.includes(user.name)} type="checkbox" />{' '}
                                            </span> : null
                                    }
                                </div>
                            </Col>
                        ))
                    }
                </Row>
            );
        }
    }


    render() {
        const { role, team, questMember, questRound, score } = this.state;
        console.log("state : ", this.state);
        return (
            <div className="centered-form">
                <SelectTeam
                    getUserList={() => this.getUserList()}
                    users={this.state.users}
                    role={role} team={team}
                    member={questMember.length > 0 ? questMember[questRound] : null}
                    leader={this.state.leader}
                    room={this.state.room}
                    gameState={this.state.gameState}
                    name={this.state.name}
                    id={this.state.id}
                    score={score}
                />
            </div>
        );
    }
}

export default InGame;