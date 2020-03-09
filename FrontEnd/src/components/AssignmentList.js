import React, { Component } from 'react';
import Assignment from './Assignment';
class AssignmentList extends Component{
    state = {
        current_assignment: null, //id of current selected assignment
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

    onChangeAssignment = (event) => {
        this.setState({current_assignment: event.target.value})
        console.log(event.target.value);
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

        this.setState({current_assignment: assignment[0].id, assignments:assignment});
    }

    render(){
        return(
            <div className="container">
                <div className="content-container">
                    <div id="select-assignment">
                        <select id="dropdown-assignment-selector" onChange={this.onChangeAssignment}>
                             if (this.state['assignments']) {
                              this.state['assignments'].map(
                                (res)=> <option value={res.id}>{res.name}</option>
                            )
                          }
                        </select>
                    </div>
                    <div className="assignments-container">
                        {[{
                            name:'Maidul Islam', 'user_id':234, 'assignment_id':9393},
                            {name:'Maidul Islam', 'user_id':234, 'assignment_id':9393},
                            {name:'Maidul Islam', 'user_id':234, 'assignment_id':9393},
                            {name:'Maidul Islam', 'user_id':234, 'assignment_id':9393},
                            {name:'Maidul Islam', 'user_id':234, 'assignment_id':9393}
                         ].map((res) => < Assignment name={res.name} assignment_id={this.state.current_assignment} student_id={res.user_id}/>)}
                    </div>
                </div>
            </div>
        )
    }
}

export default AssignmentList;
