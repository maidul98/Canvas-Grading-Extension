import React from 'react';
import ReactDOM from 'react-dom';
import './dashboard.css';
import * as serviceWorker from './serviceWorker';

class Screen extends React.Component {

  render(){
    return (
      <div>
      <div class="top_bar">
      Canvas Grading Extension
      </div>
      <div class = "mid">
      Name of Student:
      </div>
      </div>
    )
  }

}



ReactDOM.render(<Screen/>, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
