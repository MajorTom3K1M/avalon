import React from 'react';
import {
    getUserList, requestUserList,
    unsubscribeToGetUsers, sendGameState,
    gameState, GAME_STATE
} from '../../utils/socket';
import { history } from '../../helpers';
import Swal from 'sweetalert2';

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
            score: { evilWin: 0, goodWin: 0 },
            selectMerlin: ''
        }
        getUserList((users) => {
            this.setState({ users }, () => {
                const { room, name } = this.state;
                let thisUser = users.find((user) => user.name === name && user.room === room)
                if (thisUser) {
                    this.setState({ leader: thisUser.leader ? true : false, id: thisUser.id, role: thisUser.role ? thisUser.role : '', id: thisUser.id });
                }
            });
        });

        this.handleCheckbox = this.handleCheckbox.bind(this);
        this.findMerlinCheckbox = this.findMerlinCheckbox.bind(this);
        this.onClickConfirmMerlin = this.onClickConfirmMerlin.bind(this);
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
            let timerInterval;
            switch (gameStateParams.state) {
                case GAME_STATE.INIT_STATE:
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
                    // notify evil win and who vote
                    Swal.fire({
                        html: `
                            <span class="d-flex justify-content-center" style={{ paddingTop: 10 }}>
                                <h1 style="color:green;">ภารกิจสำเร็จ</h1>
                            </span>
                            <span className="d-flex justify-content-center">
                                <span className="d-flex">จะปิดใน <b></b> milliseconds.</span>
                            </span>
                        `,
                        timer: 3000,
                        timerProgressBar: true,
                        onBeforeOpen: () => {
                            Swal.showLoading()
                            timerInterval = setInterval(() => {
                                const content = Swal.getContent()
                                if (content) {
                                    const b = content.querySelector('b')
                                    if (b) {
                                        b.textContent = Swal.getTimerLeft()
                                    }
                                }
                            }, 100)
                        },
                        onClose: () => {
                            clearInterval(timerInterval)
                        }
                    });
                    newScoreObj.goodWin++;
                    this.setState({ score: newScoreObj });
                    sendGameState({ state: GAME_STATE.MISSION_SUCCESS, room: params.room });
                    break;
                case GAME_STATE.MISSION_FAIL:
                    // notify evil win and who vote
                    Swal.fire({
                        html: `
                                <span class="d-flex justify-content-center" style={{ paddingTop: 10 }}>
                                    <h1 style="color:red;">Evil แฝงอยู่ในทีมทำภารกิจ</h1>
                                </span>
                                <span className="d-flex justify-content-center">
                                    <span className="d-flex">จะปิดใน <b></b> milliseconds.</span>
                                </span>
                        `,
                        timer: 3000,
                        timerProgressBar: true,
                        onBeforeOpen: () => {
                            Swal.showLoading()
                            timerInterval = setInterval(() => {
                                const content = Swal.getContent()
                                if (content) {
                                    const b = content.querySelector('b')
                                    if (b) {
                                        b.textContent = Swal.getTimerLeft()
                                    }
                                }
                            }, 100)
                        },
                        onClose: () => {
                            clearInterval(timerInterval)
                        }
                    });
                    newScoreObj.evilWin++;
                    this.setState({ score: newScoreObj });
                    sendGameState({ state: GAME_STATE.MISSION_FAIL, room: params.room });
                    break;
                case GAME_STATE.FIND_MERLIN:
                    Swal.fire({
                        html: `
                                <span class="d-flex justify-content-center" style={{ paddingTop: 10 }}>
                                    <h1 style="color:yellow;">ทีม Evil ตามหา Merlin </h1>
                                </span>
                                <span className="d-flex justify-content-center">
                                    <span className="d-flex">จะปิดใน <b></b> milliseconds.</span>
                                </span>
                        `,
                        timer: 5000,
                        timerProgressBar: true,
                        onBeforeOpen: () => {
                            Swal.showLoading()
                            timerInterval = setInterval(() => {
                                const content = Swal.getContent()
                                if (content) {
                                    const b = content.querySelector('b')
                                    if (b) {
                                        b.textContent = Swal.getTimerLeft()
                                    }
                                }
                            }, 100)
                        },
                        onClose: () => {
                            clearInterval(timerInterval)
                        }
                    });
                    break;
                case GAME_STATE.GOOD_WIN:
                    Swal.fire({
                        html: `
                                <span class="d-flex justify-content-center" style={{ paddingTop: 10 }}>
                                    <h1 style="color:green;">ทีม Good ชนะ </h1>
                                </span>
                                <span className="d-flex justify-content-center">
                                    <span className="d-flex">จะปิดใน <b></b> milliseconds.</span>
                                </span>
                        `,
                        timer: 5000,
                        timerProgressBar: true,
                        onBeforeOpen: () => {
                            Swal.showLoading()
                            timerInterval = setInterval(() => {
                                const content = Swal.getContent()
                                if (content) {
                                    const b = content.querySelector('b')
                                    if (b) {
                                        b.textContent = Swal.getTimerLeft()
                                    }
                                }
                            }, 100)
                        },
                        onClose: () => {
                            clearInterval(timerInterval)
                        }
                    });

                    // Reset
                    sendGameState({ state: GAME_STATE.RESET, room: this.state.room });
                    this.setState({ questRound: 0, score: { evilWin: 0, goodWin: 0 }, selectMerlin: '' });
                    break;
                case GAME_STATE.BAD_WIN:
                    Swal.fire({
                        html: `
                                <span class="d-flex justify-content-center" style={{ paddingTop: 10 }}>
                                    <h1 style="color:red;">ทีม Evil ชนะ</h1>
                                </span>
                                <span className="d-flex justify-content-center">
                                    <span className="d-flex">จะปิดใน <b></b> milliseconds.</span>
                                </span>
                        `,
                        timer: 5000,
                        timerProgressBar: true,
                        onBeforeOpen: () => {
                            Swal.showLoading()
                            timerInterval = setInterval(() => {
                                const content = Swal.getContent()
                                if (content) {
                                    const b = content.querySelector('b')
                                    if (b) {
                                        b.textContent = Swal.getTimerLeft()
                                    }
                                }
                            }, 100)
                        },
                        onClose: () => {
                            clearInterval(timerInterval)
                        }
                    });

                    // Reset
                    sendGameState({ state: GAME_STATE.RESET, room: this.state.room });
                    this.setState({ questRound: 0, score: { evilWin: 0, goodWin: 0 }, selectMerlin: '' });
                    break;
                default:
                    break;
            }

            if (gameStateParams.type === 'changeState') {
                this.setState({ gameState: gameStateParams.state }, () => {
                    console.log("change state : ", this.state);
                });
            }
            if (gameStateParams.type === 'updatePlayerList') {
                this.setState({ users: gameStateParams.users });
            }
            if (gameStateParams.type === 'updateLeader') {
                let thisUser = gameStateParams.users.find((user) => (user.id === this.state.id));
                this.setState({ leader: thisUser.leader ? true : false, team: [], users: gameStateParams.users });
            }
            if (gameStateParams.type === 'updateRound') {
                this.setState({ questRound: gameStateParams.round });
            }
            if (gameStateParams.type === 'notification') {
                if (gameStateParams.name === 'reject') {
                    Swal.fire({
                        html: `
                            <span class="d-flex justify-content-center" style={{ paddingTop: 10 }}>
                                <h1 style="color:red;">การจัดทีมถูกปฏิเสธ</h1>
                            </span>
                            <span className="d-flex justify-content-center">
                                <span className="d-flex">จะปิดใน <b></b> milliseconds.</span>
                            </span>
                        `,
                        timer: 5000,
                        timerProgressBar: true,
                        onBeforeOpen: () => {
                            Swal.showLoading()
                            timerInterval = setInterval(() => {
                                const content = Swal.getContent()
                                if (content) {
                                    const b = content.querySelector('b')
                                    if (b) {
                                        b.textContent = Swal.getTimerLeft()
                                    }
                                }
                            }, 100)
                        },
                        onClose: () => {
                            clearInterval(timerInterval)
                        }
                    });
                } else if (gameStateParams.name === 'approve') {
                    Swal.fire({
                        html: `
                            <span class="d-flex justify-content-center" style={{ paddingTop: 10 }}>
                                <h1 style="color:green;">จัดตั้งทีมทำภารกิจสำเร็จ</h1>
                            </span>
                            <span className="d-flex justify-content-center">
                                <span className="d-flex">จะปิดใน <b></b> milliseconds.</span>
                            </span>
                        `,
                        timer: 5000,
                        timerProgressBar: true,
                        onBeforeOpen: () => {
                            Swal.showLoading()
                            timerInterval = setInterval(() => {
                                const content = Swal.getContent()
                                if (content) {
                                    const b = content.querySelector('b')
                                    if (b) {
                                        b.textContent = Swal.getTimerLeft()
                                    }
                                }
                            }, 100)
                        },
                        onClose: () => {
                            clearInterval(timerInterval)
                        }
                    });
                }
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

    findMerlinCheckbox(e) {
        if (e.currentTarget.checked) {
            this.setState({ selectMerlin: e.currentTarget.value });
        } else {
            this.setState({ selectMerlin: '' });
        }
    }

    onClickConfirmMerlin() {
        let params = { state: this.state.gameState, room: this.state.room, selectMerlin: this.state.selectMerlin };
        sendGameState(params);
        this.setState({ selectMerlin: '' });
    }

    getUserList() {
        const { users, role, leader, gameState, team, selectMerlin } = this.state;
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
        } else if (role?.toLowerCase() === 'evilteam' || role?.toLowerCase() === 'evilleader') {
            return (
                <Row>
                    {
                        users.map((user, ind) => (
                            <Col sm={6} style={{ paddingBottom: 5 }} key={ind} >
                                <div className={user.role?.toLowerCase() === 'evilteam' || user.role?.toLowerCase() === 'evilleader' ? "outline danger" : "outline secondary"}>
                                    {user.name} {user.role?.toLowerCase() === 'evilteam' || user.role?.toLowerCase() === 'evilleader' ? '😈' : ''} {user.leader ? '👑' : ''}
                                    {
                                        gameState === GAME_STATE.SEND_MISSION && leader ?
                                            <span className="float-right align-middle justify-content-center">
                                                <input onChange={this.handleCheckbox} value={user.name} checked={team.includes(user.name)} type="checkbox" />{' '}
                                            </span> : null
                                    }
                                    {
                                        role?.toLowerCase() === 'evilleader' && gameState === GAME_STATE.FIND_MERLIN ?
                                            <span className="float-right align-middle justify-content-center">
                                                <input onChange={this.findMerlinCheckbox} value={user.name} checked={selectMerlin === user.name} type="checkbox" />{' '}
                                            </span>
                                            : null
                                    }
                                </div>
                            </Col>
                        ))
                    }
                    {
                        gameState === GAME_STATE.FIND_MERLIN && role?.toLowerCase() === 'evilleader' && selectMerlin ?
                            <Col style={{ paddingTop: 10 }}>
                                <span className="d-flex justify-content-center">
                                    <button onClick={this.onClickConfirmMerlin} className="custom_button button_success">Confirm Merlin</button>
                                </span>
                            </Col> : null
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