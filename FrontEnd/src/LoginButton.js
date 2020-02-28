import React, { Component } from 'react';
import {Link} from "react-router-dom";

class LoginButton extends Component {

    render(){
      return (
          <Link to="/assignments">
          <button className="log_but"> Cornell Login</button>
          </Link>
      )
    }
  }

  export default LoginButton;
