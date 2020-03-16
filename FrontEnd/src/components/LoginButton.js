import React, { Component } from 'react';
import {Link, Redirect} from "react-router-dom";

class LoginButton extends Component {
    state = {
      redirectToReferrer: false
    }
    login = () => {
      fakeAuth.authenticate(() => {
        this.setState(() => ({
          redirectToReferrer: true
        }))
      })
    }

    render(){
      const { from } = this.props.location.state || { from: { pathname: '/' }}
      const { redirectToReferrer } = this.state

      if (redirectToReferrer === true) {
        return <Redirect to= {from} />
      }

      return (
          <div className = "login_button fade">
            <Button />
            <Link to="/assignments">
              <button onClick={this.login} className="log_but"> Cornell Login</button>
            </Link>
          </div>
      )
    }
  }

  export default LoginButton;
