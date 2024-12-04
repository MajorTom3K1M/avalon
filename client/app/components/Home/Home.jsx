import React from 'react';
import { history } from '../../helpers';

class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            name: "",
            room: ""
        }

        this.onChange = this.onChange.bind(this);
        this.onClickJoin = this.onClickJoin.bind(this);
    }

    onClickJoin() {
        if (this.state.name && this.state.room) {
            const { name, room } = this.state;
            history.push(`/${room}`, { name, room });
        } else {
            alert(`ใส่"ชื่อ"กับ"ห้อง"ด้วยสัส 🖕🖕🖕`);
        }
    }

    onChange(e) {
        const { attributes: { name: { value: attrName } }, value } = e.currentTarget
        this.setState({ [attrName]: value })
    }

    renderFireflies = (flyfliesQty) => {
        let fireflies = []
        for (let i = 0; i < flyfliesQty; i++) {
            fireflies.push(<div className="firefly"></div>)
        }
        return fireflies
    }

    render() {
        return (
            <div className="layout-bg firefly-container">
                {this.renderFireflies(15)}
                <div className="main-container">
                    <div className="card">
                        <div className="logo-container">
                            <img style={{ width: "-webkit-fill-available" }} className="" src="../../../assets/img/avalon-logo.png"></img>
                        </div>
                        <div className="section-header">
                            <hr className="divider" />
                            <span className="section-label">Username</span>
                            <hr className="divider" />
                        </div>
                        <div className="input-button-container">
                            <div className="input-container">
                                <input onChange={this.onChange} className="input-field" type="text" name="name" placeholder="Username"/>
                            </div>
                        </div>
                        {/* <div className="section-header">
                            <hr className="divider" />
                            <span className="section-label">Create Game</span>
                            <hr className="divider" />
                        </div>
                        <div className="button-container">
                            <button className="create-button">Create Room</button>
                        </div> */}
                        <div className="section-header">
                            <hr className="divider" />
                            <span className="section-label">Join Game</span>
                            <hr className="divider" />
                        </div>

                        <div className="input-button-container">
                            <div className="input-container">
                                <input onChange={this.onChange} className="input-field" type="text" name="room" placeholder="ex: fm2r"/>
                            </div>

                            <button className="join-button" onClick={this.onClickJoin}>Join</button>
                        </div>
                    </div>
                </div>
                {/* <div className="centered-form__form">
                    <div className="form-field">
                        <h3>Join a Avalon Game</h3>
                    </div>
                    <div className="form-field">
                        <label>Display name</label>
                        <input onChange={this.onChange} type="text" name="name" autoFocus />
                    </div>
                    <div className="form-field">
                        <label>Room name</label>
                        <input onChange={this.onChange} type="text" name="room" autoFocus />
                    </div>
                    <div className="form-field">
                        <button className="custom_button" onClick={this.onClickJoin}>Join</button>
                    </div>
                </div> */}
            </div>
        );
        // return (
        //     <div className="centered-form">
        //         <div className="centered-form__form">
        //             <div className="form-field">
        //                 <h3>Join a Avalon Game</h3>
        //             </div>
        //             <div className="form-field">
        //                 <label>Display name</label>
        //                 <input onChange={this.onChange} type="text" name="name" autoFocus />
        //             </div>
        //             <div className="form-field">
        //                 <label>Room name</label>
        //                 <input onChange={this.onChange} type="text" name="room" autoFocus />
        //             </div>
        //             <div className="form-field">
        //                 <button className="custom_button" onClick={this.onClickJoin}>Join</button>
        //             </div>
        //         </div>
        //     </div>
        // );
    }
}

export default Home;