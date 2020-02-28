import React, { Component } from 'react';
import {Link} from "react-router-dom";

class LoginButton extends Component {

    render(){
      return (
          <div className = "login_button">
            <Link to="/assignments">
              <button className="log_but"> Cornell Login</button>
            </Link>
          </div>
      )
    }
  }

  export default LoginButton;
