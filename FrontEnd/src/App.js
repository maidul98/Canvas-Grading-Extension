import React from 'react';
import {BrowserRouter, Route, Switch} from 'react-router-dom';
import Assignment from './Assignment';
import LoginButton from './loginbutton'
import './index.css';


class App extends React.Component {
  render(){
    return (
    <BrowserRouter>
      <div>
        <LoginButton />
        <Switch>
          <Route exact path = "/" component={LoginButton}/>
          <Route exact path="/Assignment" component={Assignment}/>
        </Switch>
      </div>
    </BrowserRouter>
    )
  }
}

export default App;
