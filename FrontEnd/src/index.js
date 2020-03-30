import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import {render} from 'react-dom';
//Alerts
import { transitions, positions, Provider as AlertProvider } from 'react-alert';
import AlertTemplate from 'react-alert-template-basic';
import App from './App';
const options = {
    position: positions.BOTTOM_CENTER,
    timeout: 5000,
    transition: transitions.FADE
};
 
const Root = () => (
    <AlertProvider template={AlertTemplate} {...options}>
        <App />
    </AlertProvider>
);
 
render(<Root />, document.getElementById('root'));
