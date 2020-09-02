import React from 'react';
import { getUserList, requestUserList } from '../../utils/socket'
import { history } from '../../helpers';

import {
    Col,
    Row,
    Container,
} from 'reactstrap'

class InGame extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            room: null,
            name: null,
            status: false,
            leader: false,
            role: '',
            users: []
        }
        getUserList((users) => {
            this.setState({ users }, () => {
                const { room, name } = this.state;
                let thisUser = users.find((user) => user.name === name && user.room === room)
                if (thisUser) {
                    this.setState({ leader: thisUser.leader ? true : false, id: thisUser.id, role: thisUser.role ? thisUser.role : '' });
                }
            });
            console.log(users)
        });
    }

    componentDidMount() {
        let params = this.props.location.state;
        if (!params || !params.name || !params.room) {
            history.push('/');
        } else {
            this.setState({ name: params.name, room: params.room, leader: params.leader ? params.leader : false });
            requestUserList(params);
        }
    }

    getUserList() {
        const { users, role } = this.state;
        // EvilLeader Merlin can't see 
        // Merlin can't see EvilLeader see EvilTeam
        if (role.toLowerCase() === 'merlin') {
            return (
                <Row>
                    {
                        users.map((user, ind) => (
                            <Col sm={6} style={{ paddingBottom: 5 }} key={ind} >
                                <div className={ user.role?.toLowerCase() === 'evilteam' ? "outline danger" : "outline secondary"}>
                                    {user.name} { user.role?.toLowerCase() === 'evilteam' ? '😈' : ''} {user.leader ? '👑' : ''}
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
                                <div className={ user.role?.toLowerCase() === 'evilteam' || user.role.toLowerCase() === 'evilleader' ? "outline danger" : "outline secondary"}>
                                    {user.name} { user.role?.toLowerCase() === 'evilteam' || user.role.toLowerCase() === 'evilleader' ? '😈' : ''} {user.leader ? '👑' : ''}
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
                                </div>
                            </Col>
                        ))
                    }
                </Row>
            );
        }
    }

    render() {
        const { role } = this.state;
        return (
            <div className="centered-form">
                <div className="centered-form__bigger_form">
                    <div className="form-field">
                        <h1>{role}</h1>
                    </div>
                    <div className="form-field">
                        <Container fluid>
                            {this.getUserList()}
                        </Container>
                    </div>
                    <div className="form-field">

                    </div>
                </div>
            </div>
        );
    }
}

export default InGame