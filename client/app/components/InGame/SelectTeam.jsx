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

        this.onConfirm = this.onConfirm.bind(this);
        this.onVoteApprove = this.onVoteApprove.bind(this);
        this.onVoteReject = this.onVoteReject.bind(this);
    }

    onConfirm() {
        const { gameState, room } = this.props;
        sendGameState({ state: gameState, type: 'confirm', room: room });
    }
    
    onVoteApprove() {
        const { gameState, room, id } = this.props;
        sendGameState({ state: gameState, type: 'vote', room: room, vote: true, id: id });
    }
    
    onVoteReject() {
        const { gameState, room, id } = this.props;
        sendGameState({ state: gameState, type: 'vote', room: room, vote: false, id: id });
    }

    render() {
        const { getUserList, role, team, member, leader, gameState } = this.props;
        return (
            <div className="centered-form__bigger_form">
                <div className="form-field">
                    <h1>{role}</h1>
                </div>
                <div className="form-field">
                    <Container fluid>
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
                                        gameState === GAME_STATE.SEND_MISSION && team.length === member && leader === true ?
                                        <span className="d-flex justify-content-center" style={{ paddingTop: 10 }}>
                                            <button className="custom_button button_success" onClick={this.onConfirm}>Confirm</button>
                                        </span> : null
                                    }
                                    {
                                        gameState === GAME_STATE.VOTE && team.length === member && leader === false ?
                                        <span className="d-flex justify-content-center" style={{ paddingTop: 10 }}>
                                            <button className="custom_button button_success" onClick={this.onVoteApprove}>Approve</button>
                                            <span style={{ paddingLeft: 5, paddingRight: 5 }}></span>
                                            <button className="custom_button button_danger" onClick={this.onVoteReject}>Reject</button>
                                        </span> : null
                                    }
                                </div>
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
    getUserList: PropTypes.func.isRequired,
    role: PropTypes.string.isRequired,
    team: PropTypes.array.isRequired,
    member: PropTypes.number,
    leader: PropTypes.bool.isRequired,
    id: PropTypes.string
};

export default SelectTeam;