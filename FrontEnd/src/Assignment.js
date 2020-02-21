import React, { Component } from 'react';

class Assignment extends Component{
    state = {
        clicked: false
      };

    toggleButton = () => {
        this.setState({clicked: !this.state.clicked});
        //implement expand/collapse button 
    }
    render(){
        const props = this.props;
        const name = props.name;
        const id = props.id;

        return(
            <div>
                <button id={id} onClick={this.toggleButton}><strong>{name}</strong></button>
            </div>
        )
    }
}

export default Assignment;