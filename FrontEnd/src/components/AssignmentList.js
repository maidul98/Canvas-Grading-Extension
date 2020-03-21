import React, { Component, useEffect, useState} from 'react';
import Assignment from './Assignment';
import Form from './Form';
import Alert from 'react-bootstrap/Alert'
import LoadingIcon from './LoadingIcon';
import { useFetch } from "../useFetch";
import Button from 'react-bootstrap/Button'

// function PushGrades(){
//     const requestType = {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({"name":"test","salary":"123","age":"23"})
//     }

//     const { data, isLoading, hasError} = useFetch("http://dummy.restapiexample.com/api/v1/create",{}, requestType);

//     useEffect(()=>{
//     console.log(data)
//     }, [data])

//     return(<div>Push grade</div>)
// }

function Submissions(props){
    const [submissions, setSubmissions] = useState([])
    const { data, isLoading, hasError, setUrl} = useFetch("/get-assigned-submissions-for-assigment?user_id=1&assigment_id=0",[]);
    const [alertMessage, setAlertMessage] = useState({})
    
    useEffect(()=>{
        setUrl("/get-assigned-submissions-for-assigment?user_id=1&assigment_id="+props.assignment_id)
        setSubmissions(data)

        if(submissions.length == 0){
            setAlertMessage({type:"primary", message:"Looks like there are no submissions to grade for the selected assignment yet."})
        }else if(hasError){
            setAlertMessage({type:"warning", message:"Looks like something went wrong when getting your submissions. Please try reload and try again."})
        }else{
            setAlertMessage({})
        }

    }, [props, data, submissions.length])

    return (
        <div>
        {/* <PushGrades/> */}
        {(isLoading)? <LoadingIcon show={true}/> : <></>}
        { 
            (submissions.length == 0)
            ? <Alert variant={alertMessage['type']}>{alertMessage['message']}</Alert>
            : <></>
        }
        {submissions.map(res => <div key={"container-"+res.id}><Assignment key={res.id} submissionDetails={res} bulk_edit={props.bulk_edit}/>{props.bulk_edit?<Form key={"form-"+res.id} id={res.id}/>:null}</div>)}
        </div>
        )
}

function AssignmentList(props) {
    const [assignments, setAssignments] = useState([])
    const [bulk_edit, setBulk_edit]     = useState(false)
    const [current_assignment_id, setCurrent_assignment_id] = useState(0)
    const { data, isLoading, hasError} = useFetch("/get-published-assignments",[]);

    useEffect(()=>{
        if(Array.isArray(data)){
            let reOrdered = data.sort(function compare(a, b) {
                var dateA = new Date(a.due_at);
                var dateB = new Date(b.due_at);
                return dateB-dateA;
            });
            setAssignments(reOrdered)
        }
    }, [data])


    
    function handleOnChange(e){
        if(Number.isInteger(parseInt(e.target.value))){
            setCurrent_assignment_id(e.target.value) 
        }
    }

    function bulkEdit(){
        setBulk_edit(!bulk_edit);
    }

    return (
        <div className="container">
            {(isLoading)? <LoadingIcon show={true}/> : <></>}
            <div className="content-container">
                <Button variant="dark" className="float-right" size="lg" onClick={bulkEdit}>{bulk_edit?"Switch to simple edit":"Bulk edit"}</Button>
                <div id="select-assignment">
                <select id="dropdown-assignment-selector" onChange={handleOnChange}>
                    {assignments.map((res)=> <option key={res.id} value={res.id}>{res.name}</option>)}
                </select>
                </div>
                <div className="assignments-container">
                    <Submissions assignment_id={current_assignment_id} bulk_edit={bulk_edit}/>
                </div>
                {bulk_edit?<Button>Submit feedback for all students</Button>:null}
            </div>
        </div>
    );
}

export default AssignmentList


