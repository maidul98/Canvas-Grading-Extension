import React, { Component } from 'react';
import Student from './Student';
import styles from './App.module.css';
import {BrowserRouter, Route, Switch} from 'react-router-dom';


class Assignment extends Component{
    state = {
        clicked: false,
        students: null
      };

    renderStudent = (id, name) => {
        return (
            <Student id = {id} name={name}/>
        )
    }

    componentDidMount() {
        if(this.state.students==null){
            fetch('/get-enrollments')
            .then(resp => {return resp.json()})
            .then(students => {this.setState({students: students });})
            .catch(error=>console.log(error));
        }

      }

    toggleButton = () => {
        this.setState({clicked: !this.state.clicked});
    }
    
    render(){
        const props = this.props;
        const name = props.name;
        const id = props.id;

        return(
            <div>
                <button className = {styles.Button} id={id} onClick={this.toggleButton}><strong>{name}</strong></button>
                {this.state.students!=null&&this.state.clicked?this.state.students.map(d=>this.renderStudent(d.login_id, d.name)):null}
            </div>
        )
    }
}

export default Assignment;
