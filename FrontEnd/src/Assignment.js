import React, { Component } from 'react';
import Student from './Student';
import StudentList from './StudentList';
import styles from './App.module.css';
import {Link, useHistory} from 'react-router-dom';


class Assignment extends Component{
    state = {
        id: null, //assignment ID from Canvas
    };

    handleClick = () => {
        this.props.history.push("/students");
    }

    render(){
        const props = this.props;
        const name = props.name;
        const id = props.id;

        return(
            <Link to="/students">
            <button className = {styles.Button} id={id} key={id} onClick={this.handleClick}><strong>{name}</strong></button>
            </Link>
        )
    }
}

export default Assignment;
