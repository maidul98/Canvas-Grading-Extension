import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter, Link} from 'react-router-dom';
import {withRouter} from 'react-router';
import './index.css';
import * as serviceWorker from './serviceWorker';

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

export default withRouter(LoginButton)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
