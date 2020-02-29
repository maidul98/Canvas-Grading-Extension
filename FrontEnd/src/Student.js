import React, { Component } from 'react';
import {Link} from "react-router-dom";
import styles from './App.module.css';

class Student extends Component{
    state = {
        clicked: false,
        students: null
      };

    render(){
        const props = this.props;
        const name = props.name;
        const id = props.id;

        return(
                <Link to = {"/dashboard/"+id}>
                  <button className = {styles.Student} id={id}><strong>{name}</strong></button>
                </Link>
        )
    }
}

export default Student;
