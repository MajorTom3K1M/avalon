import React from 'react';
import { sendGameState, GAME_STATE } from '../../utils/socket'
import PropTypes from 'prop-types';
import { history } from '../../helpers';

import {
    Container,
} from 'reactstrap';

class SelectTeam extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            vote: '',
            missionVote: ''
        }

        this.onConfirm = this.onConfirm.bind(this);
        this.onVoteApprove = this.onVoteApprove.bind(this);
        this.onVoteReject = this.onVoteReject.bind(this);
        this.onSuccess = this.onSuccess.bind(this);
        this.onFail = this.onFail.bind(this);

        this.evilRole = ['evilleader', 'evilteam', 'assassin', 'stupidevil']
    }

    onConfirm() {
        const { gameState, room } = this.props;
        sendGameState({ state: gameState, type: 'confirm', room: room });
    }

    onVoteApprove() {
        const { gameState, room, id } = this.props;
        this.setState({ vote: 'approve' });
        sendGameState({ state: gameState, type: 'vote', room: room, vote: true, id: id });
    }

    onVoteReject() {
        const { gameState, room, id } = this.props;
        this.setState({ vote: 'reject' });
        sendGameState({ state: gameState, type: 'vote', room: room, vote: false, id: id });
    }

    onSuccess() {
        const { gameState, room, team } = this.props;
        this.setState({ missionVote: 'success' });
        sendGameState({ state: gameState, type: 'vote', room: room, vote: true, team: team });
    }

    onFail() {
        const { gameState, room, team } = this.props;
        this.setState({ missionVote: 'fail' });
        sendGameState({ state: gameState, type: 'vote', room: room, vote: false, team: team });
    }

    render() {
        const { getUserList, role, team, member, leader, gameState, name, users, score } = this.props;
        const { vote, missionVote } = this.state;
        return (
            <div className="centered-form__bigger_form">
                <div className="form-field">
                    <h1>{role}</h1>
                </div>
                <div className="form-field">
                    <Container fluid>

                        <div className="outline secondary">
                            <span className="float-left">
                                SCORE :
                            </span>
                            <br />
                            <span className="d-flex justify-content-center" style={{ paddingTop: 10 }}>
                                <span style={{ color: 'red' }}>EVIL SCORE: {score.evilWin} / 3</span>
                            </span>
                            <span className="d-flex justify-content-center" style={{ paddingTop: 10 }}>
                                <span style={{ color: 'green' }}>GOOD SCORE: {score.goodWin} / 3</span>
                            </span>
                        </div>
                        <div style={{ paddingTop: 10 }}></div>

                        {
                            team.length > 0 ?
                                <div className="outline secondary">
                                    <span className="float-left">
                                        สมาชิกที่ถูกเลือกไปทำภารกิจ :
                                    </span>
                                    <br />
                                    <span>
                                        {team.join(" ")}
                                    </span>
                                    {
                                        gameState === GAME_STATE.SEND_MISSION && member > 0 && team.length === member && leader === true ?
                                            <span className="d-flex justify-content-center" style={{ paddingTop: 10 }}>
                                                <button className="custom_button button_success" onClick={this.onConfirm}>Confirm</button>
                                            </span> : null
                                    }
                                    {
                                        gameState === GAME_STATE.VOTE && member && team.length === member && leader === false && !vote ?
                                            <span className="d-flex justify-content-center" style={{ paddingTop: 10 }}>
                                                <button className="custom_button button_success" onClick={this.onVoteApprove}>Approve</button>
                                                <span style={{ paddingLeft: 5, paddingRight: 5 }}></span>
                                                <button className="custom_button button_danger" onClick={this.onVoteReject}>Reject</button>
                                            </span> : null
                                    }
                                    {
                                        vote ?
                                            <span className="d-flex justify-content-center" style={{ paddingTop: 10 }}>
                                                {
                                                    vote === 'approve' ?
                                                        <span style={{ color: 'green' }}>คุณโหวต Approve</span> :
                                                        <span style={{ color: 'red' }}>คุณโหวต Reject</span>
                                                }
                                            </span>
                                            : null
                                    }
                                </div>
                                : null
                        }
                        {
                            vote || leader ?
                                <>
                                    <div style={{ paddingTop: 10 }}></div>
                                    <div className="outline secondary">
                                        <span className="float-left">
                                            ผู้โหวต :
                                        </span>
                                        <br />
                                        <span className="d-flex justify-content-center">
                                            <span className="d-flex">โหวต Approve :  {users.map((u) => { if (u.vote) { return u.name } }).join(" ")} </span>
                                        </span>
                                        <span className="d-flex justify-content-center">
                                            <span className="d-flex">โหวต Reject : {users.map((u) => { if (u.vote === false) { return u.name } }).join(" ")} </span>
                                        </span>
                                    </div>
                                </>
                                : null
                        }
                        {
                            gameState === GAME_STATE.MISSION && team.includes(name) ?
                                <>
                                    <div style={{ paddingTop: 10 }}></div>
                                    <div className="outline secondary">
                                        <span className="d-flex justify-content-center">
                                            {
                                                !missionVote ? (
                                                    <>
                                                        <button className="custom_button button_success" onClick={this.onSuccess}>Success</button>
                                                        <span style={{ paddingLeft: 5, paddingRight: 5 }}></span>
                                                        {
                                                            this.evilRole.includes(role.toLowerCase()) ?
                                                                <button className="custom_button button_danger" onClick={this.onFail}>Fail</button>
                                                                : null
                                                        }
                                                    </>
                                                ) : (
                                                        missionVote === 'success' ?
                                                            <span style={{ color: 'green' }}>คุณโหวต Success</span> :
                                                            <span style={{ color: 'red' }}>คุณโหวต Fail</span>
                                                    )
                                            }
                                        </span>
                                    </div>
                                </>
                                : null
                        }
                        <div style={{ padding: 10 }}></div>
                        {getUserList()}
                    </Container>
                </div>
                <div className="form-field">

                </div>
            </div>
        );
    }
}

SelectTeam.propTypes = {
    // getUserList: PropTypes.func.isRequired,
    // role: PropTypes.string.isRequired,
    // team: PropTypes.array.isRequired,
    // member: PropTypes.number,
    // leader: PropTypes.bool.isRequired,
    // id: PropTypes.string,
    // name: PropTypes.string
};

export default SelectTeam;