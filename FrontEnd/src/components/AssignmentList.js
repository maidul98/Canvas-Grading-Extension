import React, { Component } from 'react';
import Assignment from './Assignment';
import Alert from 'react-bootstrap/Alert'
import { trackPromise } from 'react-promise-tracker';

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

    onChangeAssignment = (event) =>  {
        this.submissionsForAssignment(event.target.value).then( res =>{
            if(res){
                console.log(res)
                this.setState({submissions:res})
            }
        })
    }


    bulkEdit = (event) => {
        this.setState({bulk_edit:!this.state.bulk_edit})
    }

    getAllPublishedAssignment(){
        return fetch('/get-published-assignments')
        .then(function(response){
            return response.json();
        }).then(function(json){
            return json;
        }).catch(
            function(error){
                console.log(error)
            }
        )
    }

    async componentDidMount(){
        let allAssignments = await this.getAllPublishedAssignment().then(
            res=>{
                let reOrdered = res.sort(function compare(a, b) {
                    var dateA = new Date(a.due_at);
                    var dateB = new Date(b.due_at);
                    return dateB-dateA;
                });

                this.setState({assignments: reOrdered});

                return reOrdered;
        }).catch(
            function(error){
                console.log(error)
            }
        )


        // pull submissions for inital assignment
        if(allAssignments[0]){
            this.submissionsForAssignment(allAssignments[0].id).then(
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
                    <select id="dropdown-assignment-selector" onChange={this.onChangeAssignment}>
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
