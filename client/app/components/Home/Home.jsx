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
        if(this.state.name && this.state.room) {
            const { name, room } = this.state;
            history.push(`/${room}`, { name, room });            
        } else {
            alert(`ใส่"ชื่อ"กับ"ห้อง"ด้วยสัส 🖕🖕🖕`);
        }
    }

    onChange(e) {
        const { attributes: { name: { value: attrName } }, value } = e.currentTarget
        this.setState({ [attrName] : value })
    }

    render() {
        return (
            <div className="centered-form">
                <div className="centered-form__form">
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
                </div>
            </div>
        );
    }
}

export default Home;