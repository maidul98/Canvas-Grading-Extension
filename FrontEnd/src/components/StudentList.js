import React, { Component } from 'react';
import Student from './Student';
import {BrowserRouter, Route, Switch} from 'react-router-dom';

/*
StudentList takes in an assignment id and TA id and displays a list of students for that assignment and that TA.
*/
class StudentList extends Component{
    state = {
        students: null
    };

    componentDidMount() {
        /*
        using get-enrollments to get list of students in this class
        need to change this later to get a list of students using this.props.assignment_id and this.props.TA_id
        */
        if(this.state.students==null){
            fetch('/student-enrollments')
            .then(resp => {return resp.json()})
            .then(students => {this.setState({students: students });})
            .catch(error=>console.log(error));
        }
    }

    renderStudent = (id, name) => {
        return (
            <Student id = {id} name={name} key = {id}/>
        )
    }

    render(){
        const props = this.props;
        const assignment_id = props.assignment_id;
        return(
            <div className = "fade">
              <h1>
               Assignment #
              </h1>
              <div className = "studentlist">
                {this.state.students==null? 'Loading...' :
                this.state.students.map(d=>this.renderStudent(d.user.login_id, d.user.name))}
              </div>
            </div>
        )
    }

}

export default StudentList;
