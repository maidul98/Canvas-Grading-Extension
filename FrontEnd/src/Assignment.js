import React, { Component } from 'react';

class Assignment extends Component{
    render(){
        const props = this.props;
        const name = props.name;

        return(
            <div>
                <li><strong>{name}</strong></li>
            </div>
        )
    }
}

export default Assignment;