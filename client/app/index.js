import React from 'react';
import { render } from 'react-dom';
import { history } from './helpers';

import {
  Router,
  Route,
  Switch
} from 'react-router-dom'

import Home from './components/Home/Home.jsx';
import Room from './components/Room/Room.jsx';
import InGame from './components/InGame/InGame.jsx';

// ---------- Style Import ---------- //
import './styles/styles.scss';
import 'bootstrap/dist/css/bootstrap.min.css';

render((
  <Router history={history}>
    <Switch>
      <Route exact path="/" component={Home} />
      <Route exact path="/:room" component={Room} />
      <Route exact path="/:room/ingame" component={InGame} />
    </Switch>
  </Router>
), document.getElementById('app'));
