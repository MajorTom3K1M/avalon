import React from 'react';
import { sendGameState, GAME_STATE, gameState } from '../../utils/socket'
import PropTypes from 'prop-types';
import { history } from '../../helpers';

import {
    Col,
    Row,
    Container,
} from 'reactstrap';

class SelectTeam extends React.Component {
    constructor(props) {
        super(props);
    }

    onConfirm() {
        const { gameState } = this.props;
        sendGameState({ state: gameState, type: 'confirm' });
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
                                        team.length !== member && leader === true ? null :
                                        <span className="d-flex justify-content-center" style={{ paddingTop: 10 }}>
                                            <button className="custom_button button_success" onClick={this.onConfirm}>Confirm</button>
                                        </span>
                                    }
                                    {
                                        team.length !== member && leader === false && gameState === GAME_STATE.VOTE ? false :
                                        <span className="d-flex justify-content-center" style={{ paddingTop: 10 }}>
                                            <button className="custom_button button_success" onClick={this.onConfirm}>Approve</button>
                                            <button className="custom_button button_success" onClick={this.onConfirm}>Reject</button>
                                        </span>
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
    member: PropTypes.number.isRequired,
    leader: PropTypes.bool.isRequired
};

export default SelectTeam;