import React from 'react';
import {BrowserRouter, Route, Switch} from 'react-router-dom';
import AssignmentList from './AssignmentList';
import LoginButton from './LoginButton';
import StudentList from './StudentList';
import Dashboard from './dashboard'
import './index.css';


class App extends React.Component {
  render(){
    return (
    <BrowserRouter>
      <div>
        <Switch>
          <Route path = "/" component={LoginButton} exact/>
          <Route path="/assignments" component={AssignmentList}/>
          <Route path="/students/:id" component={StudentList}/>
          <Route path="/dashboard" component={Dashboard}/>
        </Switch>
      </div>
    </BrowserRouter>
    )
  }
}

export default App;
