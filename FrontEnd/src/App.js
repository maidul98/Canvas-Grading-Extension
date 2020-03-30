import React from 'react';
import {BrowserRouter, Route, Switch, Redirect, Link} from 'react-router-dom';
import AssignmentList from './components/AssignmentList';
import DetailedAssignmentView from './components/DetailedAssignmentView'
import './index.css';
import NavigationMenu from './components/NavigationMenu';
import 'bootstrap/dist/css/bootstrap.min.css'; // bootstrap
import Breadcrumbs from './components/Breadcrumbs';
import Dashboard from './components/Professor/Dashboard'
import Welcome from './components/Welcome'
import {login, isLoggedIn, logOut} from './Auth/LoginActions';
import PrivateRoute from './Auth/PrivateRoute'

class App extends React.Component {
  state = {
    fatal_error: [],
  }
  render(){
    return (
    <div>
      <NavigationMenu/>
      <BrowserRouter>
      {isLoggedIn()
      ?<Breadcrumbs />
      :<></>
      }
          <Switch>
            <Route path = "/" component={Welcome} exact/>
            <PrivateRoute  exact path="/assignments" component={AssignmentList}/>
            <PrivateRoute   path="/assignments/:assignment_id/:student_id" component={DetailedAssignmentView} />
            <PrivateRoute  path = "/dashboard" component={Dashboard}/>
          </Switch>
      </BrowserRouter>
    </div>
    )
  }
}

export default App;
