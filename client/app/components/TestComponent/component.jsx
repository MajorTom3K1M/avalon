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
    users = [
        { name: "Jakkarin", vote: undefined },
        { name: "Jakkarin1", vote: false },
        { name: "Jakkarin2", vote: false },
        { name: "Jakkarin3", vote: false },
        { name: "Jakkarin4", vote: true },
        { name: "Jakkarin5", vote: true }
    ]

    constructor(props) {
        super(props);
        // gamePhase : selectteam, voting
        this.state = {
            gamePhase: 'selectteam',
            team: [],
            selectMerlin: ''
        }

        this.handleCheckbox = this.handleCheckbox.bind(this);
        this.findMerlinCheckbox = this.findMerlinCheckbox.bind(this);
    }

    componentDidMount() {
        getSelectedTeam((team) => {
            // console.log(team)
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
        if (e.currentTarget.checked) {
            let joined = team.concat(e.currentTarget.value);
            if (joined.length <= 2) {
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

    findMerlinCheckbox(e) {
        if (e.currentTarget.checked) {
            this.setState({ selectMerlin: e.currentTarget.value });
        } else {
            this.setState({ selectMerlin: '' });
        }
    }

    getUserList() {
        // console.log("Work!!!!");
        const { gamePhase, team, selectMerlin } = this.state;
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
                                            {/* <input onChange={this.findMerlinCheckbox} value={user.name} checked={team.includes(user.name)} type="checkbox" />{' '} */}
                                            <input onChange={this.findMerlinCheckbox} value={user.name} checked={selectMerlin === user.name} type="checkbox" />{' '}
                                        </span> : null
                                }
                            </div>
                        </Col>
                    ))
                }
                {

                    selectMerlin ?
                        <Col style={{ paddingTop: 10 }}>
                            <span className="d-flex justify-content-center">
                                <button className="custom_button button_success">Confirm Merlin</button>
                            </span>
                        </Col> : null
                }
            </Row>
        );
    }
    render() {
        const { team } = this.state;
        return (
            <div className="centered-form">
                <div className="centered-form__bigger_form">
                    <SubComponent getUserList={() => this.getUserList()} team={team} member={2} users={this.users} />
                </div>
            </div>
        );
    }
}

export default Component;