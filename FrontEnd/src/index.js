import React from 'react';
import './index.css';
import {render} from 'react-dom';
import { transitions, positions, Provider as AlertProvider } from 'react-alert';
import AlertTemplate from 'react-alert-template-basic';
import App from './App';
import axios from 'axios';

const options = {
    position: positions.BOTTOM_CENTER,
    timeout: 5000,
    transition: transitions.FADE
};

// add the cookies to every request going out 
axios.interceptors.request.use((config) => {
    config.withCredentials = true;
    config.header = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Access-Control-Allow-Credentials': true
    };
    return config;
}, (error) => {
    return Promise.reject(error);
});


// Add a response interceptor
axios.interceptors.response.use((response) => {
    return response;
}, (error) => {
    console.log(error.response);
    if(error.response != undefined){
        if(error.response.status == 401){
            if(window.location.pathname != '/'){
                window.location = '/?message=Either your session has ended or you are not logged in';
            }
        }
    }
    return Promise.reject(error);
});

const Root = () => (
    <AlertProvider template={AlertTemplate} {...options}>
        <App />
    </AlertProvider>
);
 
render(<Root />, document.getElementById('root'));
