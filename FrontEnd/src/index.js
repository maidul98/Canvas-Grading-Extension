import React from 'react';
import ReactDOM from 'react-dom';
import Assignment from './Assignment';
import './index.css';
import {BrowserRouter as Router, Route, Link } from 'react-router-dom';
import * as serviceWorker from './serviceWorker';

class LoginButton extends React.Component {

  render(){
    return (
    <div class="login_button">
    <Link to="/dashboard">
    <button onClick= "dashboard.js" class="log_but"> Cornell Login</button>
    </Link>
    </div>
    )
  }
}


ReactDOM.render(<LoginButton/>, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
