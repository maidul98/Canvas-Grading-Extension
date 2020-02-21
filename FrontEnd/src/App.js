import React from 'react';
import {BrowserRouter, Route, Switch} from 'react-router-dom';
import Assignment from './Assignment';
import LoginButton from './LoginButton'
import './index.css';


class App extends React.Component {
  render(){
    return (
    <BrowserRouter>
      <div>
        <Switch>
          <Route path = "/" component={LoginButton} exact/>
          <Route path="/Assignment" component={Assignment}/>
        </Switch>
      </div>
    </BrowserRouter>
    )
  }
}

export default App;
