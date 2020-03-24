import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class SingleSubmission extends Component{
    state = {
        id: null, //assignment ID from Canvas
    };
    
    
    render(){
        return(
            <div>
                <div className="assignment">
                    <div className="student-name">
                    <Link to={"/assignments/"+this.props['assignment_id']+"/"+this.props['student_id']}>
                        {this.props.submissionDetails['name']}
                    </Link>
                    </div>
                    <div className="grade-status">
                        <div className="grade-icon"></div>
                    </div>
                </div>
            </div>
        )
    }
}

export default SingleSubmission;
