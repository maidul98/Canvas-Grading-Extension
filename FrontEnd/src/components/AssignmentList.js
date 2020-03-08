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
            // <Assignment name="Test Assignment" id="0" history={this.props.history}/>
            
            <div className="container">
                <div className="content-container">
                    <div id="select-assignment">
                        <select id="dropdown-assignment-selector">
                            <option value="1">Homework 1</option>
                            <option value="2">Homework 2</option>
                            <option value="3">Homework 3</option>
                            <option value="4">Homework 4</option>
                        </select>
                    </div>
                    <div className="assignments-container">
                        {[1,2,3,3,4,5,6,6,6,66,6,66].map(() => < Assignment/>)}
                    </div>
                </div>
            </div>
        )
    }
}

export default AssignmentList;