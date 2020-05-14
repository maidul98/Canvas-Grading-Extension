import React, {useEffect, useCallback, useState, useContext, Suspense} from 'react';
import {BrowserRouter, Route, Switch, Link} from 'react-router-dom';
import GraderDashboard from './components/grader/GraderDashboard';
import DetailedAssignmentView from './components/grader/DetailedAssignmentView'
import NavigationMenu from './components/NavigationMenu';
import Dashboard from './components/Professor/Dashboard'
import Welcome from './components/Welcome'
import Settings from './components/Settings'
import config from './config'
import {UserContext} from './userContext';
import axios from 'axios';
// import PrivateRoute from './components/PrivateRoute'
import 'bootstrap/dist/css/bootstrap.min.css'; // bootstrap
import './index.css';

function App () {
  const [user, setUser] = useState(null);
  useEffect(()=>{
      axios({url:`${config.backend.url}/user`}).then((response)=>{
        if(response != undefined){
          setUser(response.data.user)
        }
      }).catch()
  }, [])

    return (
    <div>
      <UserContext.Provider value={user}>
        <BrowserRouter>
          <NavigationMenu/>
          <Switch>
            <Route  path = "/" component={Welcome} exact/>
            <Route  exact path="/assignments" component={GraderDashboard}/>
            <Route  path="/assignments/:assignment_id/:student_id" component={DetailedAssignmentView} />
            <Route  path = "/dashboard" component={Dashboard}/>
            <Route  path = "/settings" component={Settings}/>
          </Switch>
        </BrowserRouter>
      </UserContext.Provider>
    </div>
    )
}
export default App;