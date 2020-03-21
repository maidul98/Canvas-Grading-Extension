import React, { Component, useEffect, useState} from 'react';
import Assignment from './Assignment';
import Alert from 'react-bootstrap/Alert'
import LoadingIcon from './LoadingIcon';
import {handleErrors, showErrorMessage} from '../Functions/Helper';
import { UseOurApi } from "../HttpService";


// function AssignmentList() {
//     //states
//     const [assignments, setAssignments] = useState([])
//     const [submissions, setSubmissions] = useState([])
//     const [bulk_edit, setBulk_edit]     = useState(false)
//     const { data, isLoading, hasError } = UseOurApi("/get-published-assignments", []);

//     /**
//      * This method runs before the component
//      */
//     useEffect(()=>{
//         if(Array.isArray(data)){
//             setAssignments(data)
//         }
//     })
//     console.log(data)
//     // function  handle(e){
//     //     if(!e.target.value == undefined){
//     //     setSubmissions([<Submissions assignment_id={93965} />])
//     //     }
//     // }

//     if (isLoading) return <LoadingIcon show={true}/>;

//     return (
//         <div className="container">
//         <div className="content-container">
//             {!hasError ? hasError : <Alert variant="warning">Looks like something went wrong when getting your submissions. Please try reload and try again.</Alert>}
//             <button id="bulkEdit">{bulk_edit?"Switch to simple edit":"Bulk edit"}</button>
//             <div id="select-assignment">
//             <select id="dropdown-assignment-selector">
//                 {assignments.map((res)=> <option key={res.id} value={res.id}>{res.name}</option>)}
//             </select>
//             </div>
//             <div className="assignments-container">
//             </div>
//             </div>
//         </div>
//     );
// }

// export default AssignmentList

class AssignmentList extends Component{

    state = {
        assignments: [],
        submissions: [],
        bulk_edit: false,
        error: false,
        loading: false,
    }

    showLoadingSpinner =(show_hide)=>{
        this.setState({loading:show_hide})
    }

    /**
     * This method returns a promise object which should return the list of submissions and if there is an error, then a empty array
     * is returned.
     * @param {*} assignmentId 
     */
    submissionsForAssignment(assignmentId){
        return fetch('/get-assigned-submissions-for-assigment?user_id=1&assigment_id='+assignmentId).then(res=>handleErrors(res)).then(
            res=>{
                return res.json()
            }
        ).catch(
            error=>{
                this.setState({error:true})
                this.showLoadingSpinner(false)
            }
        )

    }

    onChangeAssignment = (event) =>  {
        this.showLoadingSpinner(true)
        this.submissionsForAssignment(event.target.value).then( res =>{
            this.showLoadingSpinner(false)
            if(Array.isArray(res)){
                this.setState({submissions:res});
            }else{
                this.setState({submissions:[]});
            }
        }).catch(
            error=>{
                console.log(error)
            }
        )
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

    /**
     * This method is invoked immediately after a component is mounted. We pull all the assignments in order of newest to oldest
     * and then we pull the submissions assigned for the latest one.  
     * Inputs: none
     */
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

        if(allAssignments[0]){ // pull submissions for the defualt selected assignment
            this.submissionsForAssignment(allAssignments[0].id).then(
                res =>{
                    if(Array.isArray(res)){
                        this.setState({submissions:res});
                    }else{
                        this.setState({submissions:[]});
                    }
                }
            ).catch(error =>{
                console.log(error)
            })
        }
    }

    /**
     * This method renders submissions from the state or if there are none, it shows alert saying there are no submissions
     * Inputs: none
     */
    showSubmissions(){
        if(this.state.submissions.length){
            return <>{this.state['submissions'].map((res) => <Assignment key={res.id} submissionDetails={res} bulk_edit={this.state.bulk_edit}/>)}</>
        }else if(this.state.error){
            return <>{<Alert variant="warning">Looks like something went wrong when getting your submissions. Please try reload and try again.</Alert>}</>
        }else{
            return <>{<Alert variant="primary">Looks like there are no submissions to grade for the selected assignment yet.</Alert>}</>
        }
    }


    render(){
        return(
            <div className="container">
                <LoadingIcon show={this.state.loading} />
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
                        {this.showSubmissions()}
                    </div>
                </div>
            </div>
        )
    }
}

export default AssignmentList;
