import React, { Component } from 'react';
import ReactDOM from 'react-dom';

class Button extends Component{
    render() {
        const url = this.props.url;
        const title = this.props.title;

        return(
            <a href={url}>{title}</a> 
        )
    }
}

ReactDOM.render(<Button/>, document.getElementById("root"));

export default Button;