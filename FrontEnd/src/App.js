import React from 'react';
import {BrowserRouter, Route, Switch, Redirect} from 'react-router-dom';
import AssignmentList from './components/AssignmentList';
import LoginButton from './components/LoginButton';
import StudentList from './components/StudentList';
import DetailedAssignmentView from './components/DetailedAssignmentView'
import './index.css';
import NavigationMenu from './components/NavigationMenu';

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
            <PrivateRoute path="/detailed-view/:student_id" component={DetailedAssignmentView}/>
          </Switch>
      </BrowserRouter>
    </div>
    )
  }
}

export default App;
