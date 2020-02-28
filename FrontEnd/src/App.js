import React from 'react';
import {BrowserRouter, Route, Switch} from 'react-router-dom';
import Assignment from './Assignment';
import LoginButton from './LoginButton'
import Dashboard from './dashboard'
import './index.css';


class App extends React.Component {
  render(){
    return (
    <BrowserRouter>
      <div>
        <Switch>
          <Route path = "/" component={LoginButton} exact/>
          <Route path="/Assignment" component={Assignment}/>
          <Route path="/dashboard" component={Dashboard}/>
        </Switch>
      </div>
    </BrowserRouter>
    )
  }
}

export default App;
