import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { usePromiseTracker } from "react-promise-tracker";

const LoadingIndicator = props => {
    const { promiseInProgress } = usePromiseTracker();
    
       return (
    promiseInProgress && 
        <h1>Hey some async call in progress ! </h1>
      );  
}

ReactDOM.render(<App><LoadingIndicator/></App>, document.getElementById('root'));
