import React, { Component } from 'react';
import Assignment from './Assignment';


function renderAssignment(id, name){
    return (
        <Assignment name={name} id={id}/>
    )
}

class AssignmentList extends Component{
    state = {
        assignments: []
    }
    
    async submissionsForAssignment(assignmentId=null){
        await fetch('/student-enrollments')
        .then(res => {return res.json()})
        .then(res =>{
            return res;
        })
        .catch(error=>
            console.log(error)
        );
    }

    async getAllPublishedAssignment(){
        await fetch('/get-published-assignments')
        .then(res => {return res.json()})
        .then(res =>{
            return res
        })
        .catch(error=>
            console.log(error)
        );
    } 
    
    onChangeAssignment = () => {
        console.log(this.state)
    }


    async componentDidMount(){
        let assignment = await fetch('/get-published-assignments')
        .then(res => {return res.json()})
        .then(res =>{
            return res;
        })
        .catch(error=>
            console.log(error)
        );

        this.setState({assignments:assignment});
        console.log(this.state)
    }

    render(){
        return(
            
            // <div>
            //     {this.props.assignments==null? 'Loading...' : 
            // this.props.assignments.map(d=>renderAssignment(this.props.name))}
            // </div>
            // <Assignment name="Test Assignment" id="0" history={this.props.history}/>
            
            <div className="container">
                <div className="content-container">
                    <div id="select-assignment">
                        <select id="dropdown-assignment-selector" onChange={this.onChangeAssignment}>
                            { this.state['assignments'].map(
                                (res)=> <option value={res.id}>{res.name}</option>
                            )}
                        </select>
                    </div>
                    <div className="assignments-container">
                        {[{
                            name:'Maidul Islam', 'user_id':234, 'assignment_id':9393}, 
                            {name:'Maidul Islam', 'user_id':234, 'assignment_id':9393},
                            {name:'Maidul Islam', 'user_id':234, 'assignment_id':9393},
                            {name:'Maidul Islam', 'user_id':234, 'assignment_id':9393},
                            {name:'Maidul Islam', 'user_id':234, 'assignment_id':9393}
                         ].map((res) => < Assignment name={res.name} id={12} />)}
                    </div>
                </div>
            </div>
        )
    }
}

export default AssignmentList;