import React, {useEffect, useState} from 'react';
import SingleSubmission from './SingleSubmission';
import QuickEditSubmission from './QuickEditSubmission';
import Alert from 'react-bootstrap/Alert';
import LoadingIcon from './LoadingIcon';
import Button from 'react-bootstrap/Button';
import { useRequest } from '@umijs/hooks';
import {removeAlert} from '../Functions.js'

export default function Submissions(props){
    const [submissions, setSubmissions] = useState([]);
    const gradesAndComments = []    
    let [submissionsError, SetSubmissionError] = useState([])
    const [gradeSubmitStatus, SetGradeSubmitStatus] = useState([])
    const [show, setShow] = useState(true);

    const fetchSubmissions = useRequest(url => url, {
        manual: true,
        onSuccess: (result, params) => {
            setSubmissions(result)
            if(result.length == 0){
                setShow(true)
                SetSubmissionError([{type:"primary", message:"You do not have any assigned submissions at this time"}])
            }else{
                SetSubmissionError([])
            }
        },
        onError: (error, params) => {
            setShow(true)
            SetSubmissionError([{type:"warning",message:'Something went wrong when pulling your submissions, please try refreshing the page.'}])
        }
    });

    const submitGrades = useRequest(url => url, {
        manual: true,
        onSuccess: (result, params) => {
            SetGradeSubmitStatus([{type:"success", message:"Your feedback has been submitted successfully"}])
        },
        onError: (error, params) => {
            SetGradeSubmitStatus([{type:"warning", message:"Something went wrong, your feedback ws not submitted, please try again in 40 seconds"}])
        }
    });

    
    useEffect(()=>{
        fetchSubmissions.run('/get-assigned-submissions-for-assigment?user_id=1&assigment_id='+props.assignment_id);
    }, [props.assignment_id]);
    
    const handleFormChange = (newSubmission) => {
        let found = gradesAndComments.some(submissionInArray=> submissionInArray.id == newSubmission.id)
        if(found){
            let index = gradesAndComments.findIndex(submissionInArray => submissionInArray.id == newSubmission.id);
            gradesAndComments[index] = newSubmission;
        }else{
            gradesAndComments.push(newSubmission)
        }
    };

    const submitForms = () => {
        submitGrades.run(
            {
                url: 'upload-submission-grades/assignments/'+props.assignment_id+'/submissions/batch-update-grades',
                method: 'post',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(gradesAndComments),
            }
        )
    }

    if(submitGrades.loading | fetchSubmissions.loading) return <LoadingIcon />

    return (
        <div>
            {submissionsError.map((obj, index) =><Alert  data-index={index} onClose={(p1, event) => removeAlert(event,submissionsError, SetSubmissionError )} show={show} dismissible variant={obj['type']}>{obj['message']}</Alert>)}
            {submissions.map(res => 
                <div key={'container-'+res.id}>
                    {
                    (props.bulk_edit)
                    ?<QuickEditSubmission key={'form-'+res.id} id={res.id} submissionDetails={res} onChange={handleFormChange}/>
                    :<SingleSubmission key={res.id} submissionDetails={res}/>
                    }
                </div>)
            }
            {gradeSubmitStatus.map((obj) =><Alert onClose={(p1, event) => removeAlert(event,gradeSubmitStatus, SetGradeSubmitStatus )} show={show} dismissible variant={obj['type']}>{obj['message']}</Alert>)}
            <Button onClick={submitForms} className={props.bulk_edit?"visible":"invisible"}>Submit feedback for all students</Button>
        </div>
    );
}
