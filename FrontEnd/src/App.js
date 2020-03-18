import React from 'react';
import {BrowserRouter, Route, Switch, Redirect, Link} from 'react-router-dom';
import Breadcrumbs from 'react-breadcrumbs';
import AssignmentList from './components/AssignmentList';
//import LoginButton from './components/LoginButton';
import StudentList from './components/StudentList';
import DetailedAssignmentView from './components/DetailedAssignmentView'
import './index.css';
import NavigationMenu from './components/NavigationMenu';
import 'bootstrap/dist/css/bootstrap.min.css'; // bootstrap

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
  render(){
    return (
    <div>
      <NavigationMenu/>

      <BrowserRouter>
          <Switch>
            <Route path = "/" component={LoginButton} exact/>
            <PrivateRoute path="/assignments" component={AssignmentList}/>
            <PrivateRoute path="/students/:assignment_id" component={StudentList}/>
            <Route  path="/detailed-view/:assignment_id/:student_id" component={DetailedAssignmentView} />
            {/* <Route exact path="/detailed-view/:assignment_id/:student_id" render = {props => <DetailedAssignmentView assignment_id={props.match.params.assignment_id} student_id={props.match.params.student_id}/> } /> */}
          </Switch>
      </BrowserRouter>
    </div>
    )
  }
}

export default App;
