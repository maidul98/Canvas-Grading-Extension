import React, { Component } from 'react';
import Spinner from 'react-bootstrap/Spinner';

class LoadingIcon extends Component{
    render(){
        return(
            <div id="overlay"> <div id="spinner_icon"> <Spinner animation="border" size="lg" /> </div> </div>
        );
    }
}

export default LoadingIcon;
