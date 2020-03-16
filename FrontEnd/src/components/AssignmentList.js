import React, { Component } from 'react';
import Assignment from './Assignment';
import Alert from 'react-bootstrap/Alert'
class AssignmentList extends Component{
    state = {
        assignments: [],
        submissions: [],
        bulk_edit: false
    }

    submissionsForAssignment(assignmentId){
        let  loadedSubmissions = fetch('/get-assigned-submissions-for-assigment?user_id=1&assigment_id='+assignmentId)
        .then(res => {return res.json()})
        .catch(error=>
            console.log(error)
        );

        return loadedSubmissions;

    }

    async getAllPublishedAssignment(){
        // (await fetch('/get-published-assignments')
        // .then(res => {return res.json()})
        // .then(res =>{
        //     return res
        // })
        // .catch(error=>
        //     console.log(error)
        // );
    }

    onChangeAssignment = (event) =>  {
        this.submissionsForAssignment(event.target.value).then( res =>{
            this.setState({submissions:res})
        })
    }

    bulkEdit = (event) => {
        this.setState({bulk_edit:!this.state.bulk_edit})
    }


    async componentDidMount(){
        let loadedAssignments = await fetch('/get-published-assignments')
        .then(res => {return res.json()})
        .then(res =>{
            return res.sort(function compare(a, b) {
                var dateA = new Date(a.due_at);
                var dateB = new Date(b.due_at);
                return dateB-dateA;
            });
        })
        .catch(error=>
            console.log(error)
        );
        this.setState({assignments: loadedAssignments});

        // set all pulled assignment to state
        if(loadedAssignments[0].id !== undefined){
            this.submissionsForAssignment(loadedAssignments[0].id).then(
                res =>{
                    this.setState({submissions:res})
                }
            ).catch(error =>{
                console.log(error)
            })
        }
    }

    render(){
        return(
            <div className="container">
                <div className="content-container">
                    <button id="bulkEdit" onClick={this.bulkEdit}>{this.state.bulk_edit?"Switch to simple edit":"Bulk edit"}</button>
                    <div id="select-assignment">
                    Assignments to grade <select id="dropdown-assignment-selector" onChange={this.onChangeAssignment}>
                             {this.state['assignments']?
                              this.state['assignments'].map(
                                (res)=> <option key={res.id} value={res.id}>{res.name}</option>
                            ):null}
                          
                        </select>
                    </div>
                    <div className="assignments-container">
                    {(() => {
                        if (!this.state.submissions.length) {
                        return (
                            <Alert variant="primary">Looks like there are no submissions to grade for the selected assignment yet.</Alert>
                        )}
                    })()
                    }

                    {this.state['submissions'].map((res) => < Assignment key={res.id} submissionDetails={res} bulk_edit={this.state.bulk_edit}/>)}
                    </div>
                </div>
            </div>
        )
    }
}

export default AssignmentList;
