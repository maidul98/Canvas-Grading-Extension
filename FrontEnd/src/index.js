import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter, Link} from 'react-router-dom';
import './index.css';
import * as serviceWorker from './serviceWorker';

const NotFound = () => {
  return "Page not found."
}

class LoginButton extends React.Component {

  render(){
    return (
    <BrowserRouter>
    <div class="login_button">
        <Link to="/Assignment">
        <button class="log_but"> Cornell Login</button>
        </Link>
    </div>
    </BrowserRouter>
    )
  }
}


ReactDOM.render(<LoginButton/>, document.getElementById('root'));

export {NotFound, LoginButton}

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
