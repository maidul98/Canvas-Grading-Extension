import React from 'react';
import {BrowserRouter, Route, Switch, Redirect, Link} from 'react-router-dom';
import AssignmentList from './components/AssignmentList';
//import LoginButton from './components/LoginButton';
import DetailedAssignmentView from './components/DetailedAssignmentView'
import './index.css';
import NavigationMenu from './components/NavigationMenu';
import 'bootstrap/dist/css/bootstrap.min.css'; // bootstrap
import Breadcrumbs from './components/Breadcrumbs';

const fakeAuth = {
  isAuthenticated: false,
  authenticate(cb) {
    this.isAuthenticated = true
    setTimeout(cb,100)
  },
  signout(cb) {
    this.isAuthenticated = false
    setTimeout(cb,100)
  }
}

class LoginButton extends React.Component {
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
      const { from } = this.props.location.state || { from: { pathname: '/assignments' }}
      const { redirectToReferrer } = this.state

      if (redirectToReferrer === true) {
        return <Redirect to= {from} />
      }

      return (
          <div className = "login_button fade">
              <button onClick={this.login} className="log_but"> Cornell Login</button>
          </div>
      )
    }
  }

const PrivateRoute = ({component: Component, ...rest}) => (
  <Route {...rest} render = {(props) => (
    fakeAuth.isAuthenticated === true
    ? <Component {...props} />
    : <Redirect to='/' />
  )} />
)

class App extends React.Component {
  state = {
    fatal_error: [],
  }
  render(){
    return (
    <div>
      <NavigationMenu/>
      <BrowserRouter>
      <Breadcrumbs />
          <Switch>
            <Route path = "/" component={LoginButton} exact/>
            <PrivateRoute exact path="/assignments" component={AssignmentList}/>
            <Route  path="/assignments/:assignment_id/:student_id" component={DetailedAssignmentView} />
            {/* <Route exact path="/detailed-view/:assignment_id/:student_id" render = {props => <DetailedAssignmentView assignment_id={props.match.params.assignment_id} student_id={props.match.params.student_id}/> } /> */}
          </Switch>
      </BrowserRouter>
    </div>
    )
  }
}

export default App;
