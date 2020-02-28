import React, { Component } from 'react';
import styles from './App.module.css';

class Assignment extends Component{
    state = {
        clicked: false,
        students: null
      };

    render(){
        const props = this.props;
        const name = props.name;
        const id = props.login_id

        return(
                <button className = {styles.Student} id={id}><strong>{name}</strong></button>
        )
    }
}

export default Assignment;
