import React, { Component } from 'react';
// import Student from './Student';
// import StudentList from './StudentList';
import { Link } from 'react-router-dom';
// import NavigationMenu from './NavigationMenu'


class Assignment extends Component{
    state = {
        id: null, //assignment ID from Canvas
    };

    componentDidMount(){
        console.log(this.props)
    }
    render(){
        return(
            <div className="assignment">
                <div className="student-name">
                <Link to={"/detailed-view/"+this.props['assignment_id']+"/"+this.props['student_id']}>
                    {this.props.submissionDetials['name']}
                </Link>
                </div>
                <div className="grade-status">
                    <div className="grade-icon"></div>
                </div>
            </div>
        )
    }
}

export default Assignment;
