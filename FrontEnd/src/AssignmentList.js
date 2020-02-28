import React, { Component } from 'react';
import Assignment from './Assignment';


function renderAssignment(name){
    return (
        <Assignment name={name}/>
    )
}

class AssignmentList extends Component{
    render(){
        return(
            /*<div>
                {this.props.assignments==null? 'Loading...' : 
            this.props.assignments.map(d=>renderAssignment(this.props.name))}
            </div>*/
            <Assignment name="Test Assignment" history={this.props.history}/>
        )
    }
}

export default AssignmentList;