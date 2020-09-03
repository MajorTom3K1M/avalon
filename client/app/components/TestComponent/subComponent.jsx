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
            hello: "World!!!"
        }
    }
    render() {
        const { getUserList, team, member } = this.props;
        return (
            <>
                <div className="form-field">
                    <h1>Your role : Merlin 😀🔮😈</h1>
                </div>
                <div className="form-field">
                    <Container fluid>
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
                                </div>
                                : null
                        }
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