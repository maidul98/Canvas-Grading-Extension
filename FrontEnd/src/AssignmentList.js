import React, { Component } from 'react';
import Assignment from './Assignment';


function renderAssignment(id, name){
    return (
        <Assignment name={name} id={id}/>
    )
}

class AssignmentList extends Component{
    render(){
        return(
            /*<div>
                {this.props.assignments==null? 'Loading...' : 
            this.props.assignments.map(d=>renderAssignment(this.props.name))}
            </div>*/
            <Assignment name="Test Assignment" id="0" history={this.props.history}/>
        )
    }
}

export default AssignmentList;