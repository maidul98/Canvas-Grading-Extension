import React, { Component } from 'react';
// import Student from './Student';
// import StudentList from './StudentList';
import { Link } from 'react-router-dom';
import DetailedAssignmentView from './DetailedAssignmentView';
// import NavigationMenu from './NavigationMenu'


class Assignment extends Component{
    state = {
        id: null, //assignment ID from Canvas
        bulk_edit: false //for collapse/expand
    };

    componentDidMount(){
        console.log(this.props)
    }
    componentDidUpdate(prevProps){
        if(this.props.bulk_edit!=prevProps.bulk_edit){
            this.setState({bulk_edit:this.props.bulk_edit});
        }
    }
    togglePanel = () => {
        this.setState({bulk_edit:!this.state.bulk_edit})
    }
    render(){
        return(
            <div className="container">
                <div className="assignment">
                    <div className="student-name">
                    <Link to={"/detailed-view/"+this.props['assignment_id']+"/"+this.props['student_id']}>
                        {this.props.submissionDetails['name']}
                    </Link>
                    </div>
                    <div className="grade-status" onClick={this.togglePanel}>
                        <div className="grade-icon"></div>
                    </div>
                </div>
                {this.state.bulk_edit?<DetailedAssignmentView bulk_edit={true}/>:null}
            </div>
        )
    }
}

export default Assignment;
