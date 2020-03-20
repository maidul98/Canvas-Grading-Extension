import React, { Component } from 'react';
import Spinner from 'react-bootstrap/Spinner'

class LoadingIcon extends Component{
    showHide(){
        if(this.props.show){
            return <div> <div id="overlay"> <div id="spinner_icon"> <Spinner animation="border" size="lg" /> </div> </div> </div>
        }else{
            return;
        }
    }
    render(){
        return(
            <div>
                {this.showHide()}
            </div>
        )
    }
}

export default LoadingIcon;
