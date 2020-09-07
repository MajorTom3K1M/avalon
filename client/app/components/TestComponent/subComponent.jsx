import React from 'react';
import { history } from '../../helpers';

import {
    Col,
    Row,
    Container,
} from 'reactstrap';

class SubComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hello: "",
            vote: '',
            gameState: true,
            score: {
                evilWin: 0,
                goodWin: 0
            }
        }

        this.onApprove = this.onApprove.bind(this);
        this.onReject = this.onReject.bind(this);
        this.onSuccess = this.onSuccess.bind(this);
    }

    componentDidUpdate(prevProps, prevState) {
        console.log(prevState.gameState);
        if(prevState.gameState !== this.state.gameState) {
            console.log("GAME STATE CHANGE!!!");
            this.setState({ vote: '' });
        }
    }

    onApprove() {
        this.setState({ vote: 'approve' });

    }

    onReject() {
        this.setState({ vote: 'reject' });
    }

    onSuccess() {
        this.setState((prevState) => ({ gameState: !prevState.gameState  }));
    }

    render() {
        const { getUserList, team, member, users } = this.props;
        const { vote, score } = this.state;
        return (
            <>
                <div className="form-field">
                    <h1>Your role : Merlin 😀🔮😈</h1>
                </div>
                <div className="form-field">
                    <Container fluid>
                        
                        <div className="outline secondary">
                            <span className="float-left">
                                SCORE :
                            </span>
                            <br/>
                            <span className="d-flex justify-content-center" style={{ paddingTop: 10 }}>
                                <span style={{ color: 'red' }}>EVIL SCORE: { score.evilWin } / 3</span>
                            </span>
                            <span className="d-flex justify-content-center" style={{ paddingTop: 10 }}>
                                <span style={{ color: 'green' }}>GOOD SCORE: { score.goodWin } / 3</span>
                            </span>
                        </div>
                        <div style={{ paddingTop: 10 }}></div>
                        
                        {
                            team ?
                                <div className="outline secondary">
                                    <span className="float-left">
                                        สมาชิกที่ถูกเลือกไปทำภารกิจ :
                                    </span>
                                    <br />
                                    <span>
                                        {team.join(" ")}
                                    </span>
                                    {
                                        team.length !== member ? null :
                                            <span className="d-flex justify-content-center" style={{ paddingTop: 10 }}>
                                                <button className="custom_button button_success">Confirm</button>
                                            </span>
                                    }
                                    {
                                        !vote ?
                                            <span className="d-flex justify-content-center" style={{ paddingTop: 10 }}>
                                                <button className="custom_button button_success" onClick={this.onApprove}>Approve</button>
                                                <span style={{ paddingLeft: 5, paddingRight: 5 }}></span>
                                                <button className="custom_button button_danger" onClick={this.onReject}>Reject</button>
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
                        <div style={{ paddingTop: 10 }}></div>
                        <div className="outline secondary">
                            <span className="float-left">
                                ผู้โหวต :
                            </span><br />
                            <span className="d-flex justify-content-center">
                                <span className="d-flex">โหวต Approve :  {users.map((u) => { if (u.vote) { return u.name } }).join(" ")} </span>
                            </span>
                            <span className="d-flex justify-content-center">
                                <span className="d-flex">โหวต Reject : {users.map((u) => { if (!u.vote && u.vote !== undefined) { return u.name } }).join(" ")} </span>
                            </span>
                        </div>
                        <div style={{ paddingTop: 10 }}></div>
                        <div className="outline secondary">
                            <span className="float-left">
                                เลือก QUEST CARD :
                            </span><br />
                            <span className="d-flex justify-content-center">
                                <button className="custom_button button_success" onClick={this.onSuccess}>Success</button>
                                <span style={{ paddingLeft: 5, paddingRight: 5 }}></span>
                            </span>
                        </div>
                        <div style={{ padding: 10 }}></div>
                        {getUserList()}
                    </Container>
                </div>
                <div className="form-field">

                </div>
            </>
        );
    }
}

export default SubComponent;