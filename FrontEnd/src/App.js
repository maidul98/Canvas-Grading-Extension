import React from 'react';
import {BrowserRouter, Route, Switch} from 'react-router-dom';
import AssignmentList from './components/AssignmentList';
import LoginButton from './components/LoginButton';
import StudentList from './components/StudentList';
import DetailedAssignmentView from './components/DetailedAssignmentView'
import './index.css';
import NavigationMenu from './components/NavigationMenu';

class App extends React.Component {
  render(){
    return (
    <div>
      <NavigationMenu/>
      <BrowserRouter>
          <Switch>
            <Route path = "/" component={LoginButton} exact/>
            <Route path="/assignments" component={AssignmentList}/>
            <Route path="/students/:assignment_id" component={StudentList}/>
            <Route path="/dashboard/:student_id" component={DetailedAssignmentView}/>
          </Switch>
      </BrowserRouter>
    </div>
    )
  }
}

export default App;
