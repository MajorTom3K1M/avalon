import React from 'react';
import { getUserList, requestUserList, selectTeam, getSelectedTeam } from '../../utils/socket';
import { history } from '../../helpers';

import SubComponent from './subComponent.jsx';

import {
    Col,
    Row,
    Container,
    Input
} from 'reactstrap';

class Component extends React.Component {
    constructor(props) {
        super(props);
        // gamePhase : selectteam, voting
        this.state = {
            gamePhase: 'selectteam',
            team: []
        }

        this.handleCheckbox = this.handleCheckbox.bind(this);
    }

    componentDidMount() {
        getSelectedTeam((team) => {
            console.log(team)
            this.setState({ team });
        });
    }

    getSelectedTeam() {

    }

    handleCheckbox(e) {
        const { team } = this.state;
        // e.currentTarget.setAttribute('checked', true);
        // console.log(e.currentTarget.checked)
        // e.currentTarget.checked = true
        console.log(this.refs);
        if (e.currentTarget.checked) {
            let joined = team.concat(e.currentTarget.value);
            if(joined.length <= 2) {
                this.setState({ team: joined }, () => {
                    selectTeam(this.state.team);
                });
            }
        } else {
            this.setState({ team: team.filter((name) => name !== e.currentTarget.value) }, () => {
                selectTeam(this.state.team);
            });
        }
    }

    getUserList() {
        // console.log("Work!!!!");
        const { gamePhase, team } = this.state;
        let users = [
            { name: "Jakkarin" },
            { name: "Jakkarin1" },
            { name: "Jakkarin2" },
            { name: "Jakkarin3" },
            { name: "Jakkarin4" },
            { name: "Jakkarin5" }
        ]
        return (
            <Row>
                {
                    users.map((user, ind) => (
                        <Col sm={6} style={{ paddingBottom: 5 }} key={ind} >
                            <div className={"outline secondary"}>
                                {user.name} {user.leader ? '👑' : ''}
                                {
                                    gamePhase === "selectteam" ?
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
    render() {
        const { team } = this.state;
        return (
            <div className="centered-form">
                <div className="centered-form__bigger_form">
                    <SubComponent getUserList={() => this.getUserList()} team={team} member={2} />
                </div>
            </div>
        );
    }
}

export default Component;