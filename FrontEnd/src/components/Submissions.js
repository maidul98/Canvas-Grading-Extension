import React, {useEffect, useState} from 'react';
import SingleSubmission from './SingleSubmission';
import QuickEditSubmission from './QuickEditSubmission';
import Alert from 'react-bootstrap/Alert';
import LoadingIcon from './LoadingIcon';
import { useFetch } from '../useFetch';
import Button from 'react-bootstrap/Button';

export default function Submissions(props){
    const [submissions, setSubmissions] = useState([]);
    const { data, isLoading, hasError, calledBy, setUrl, setCalledBy, setRequestParam} = useFetch('/get-assigned-submissions-for-assigment?user_id=1&assigment_id='+props.assignment_id,[], undefined, "get-assigned-submissions");
    const [alertMessage, setAlertMessage] = useState({});
    const gradesAndComments = []
    const [show, setShow] = useState(true);
    const successQuickEdit = false 

    useEffect(()=>{
        if(calledBy == "get-assigned-submissions"){
            setCalledBy('get-assigned-submissions');
            setRequestParam(undefined)
            setUrl('/get-assigned-submissions-for-assigment?user_id=1&assigment_id='+props.assignment_id);
            setSubmissions(data);

        }

        if(submissions.length == 0){
            setAlertMessage({type:'primary', message:'Looks like there are no submissions to grade for the selected assignment yet.'});
        }else if(hasError){
            setAlertMessage({type:'warning', message:'Looks like something went wrong when getting your submissions. Please try reload and try again.'});
        }else{
            setAlertMessage({});
        }

    }, [props, data, submissions.length]);

    
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
        const requestType = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gradesAndComments)
        }
        setCalledBy('upload-submission-grades');
        setRequestParam(requestType)
        setUrl('upload-submission-grades/assignments/'+props.assignment_id+'/submissions/batch-update-grades')
    }
    const submitFormss = () => {
        console.log('submit');
        function validateGrade(grade){
            if(grade==null || grade<0 || grade>100){
                return false;
            }
            return true;
        }
        function validateComment(comment){
            if(comment==null || comment.trim()==''){
                return false;
            }
            return true;
        }
        //assumes that comment is not null and not empty, returns a sanitized comment
        function sanitizeComment(comment){
            return comment;
        }
        let formData = []; //this is what will be sent to Canvas
        let missingGrades = false;
        let missingComments = false;
        for (const id in gradesAndComments){
            let grade = gradesAndComments[id]['assigned_grade'];
            let comment = gradesAndComments[id]['comment'];
            let gradeIsValid = validateGrade(grade);
            let commentIsValid = validateComment(comment);
            if(gradeIsValid && commentIsValid){
                let sanitizedComment = sanitizeComment(comment);
                formData.push({'id':id, 'assigned_grade':grade, 'comment':sanitizedComment, 'is_group_comment':false});
            }
            else{
                if(!gradeIsValid && !commentIsValid){
                    missingGrades = true;
                    missingComments = true;
                    //alert grader of missing grade
                }
                else if(!gradeIsValid){
                    missingGrades = true;
                    //alert grader of missing grade
                }
                else{
                    missingComments = true;
                    formData.push({'id':id, 'assigned_grade':grade, 'comment':'', 'is_group_comment':false});
                }
            }
        }
        if(!missingGrades && !missingComments){
            //submit data to backend with POST
            console.log(formData);
        }
        else{
            if(missingComments){
                console.log('missing comment');
                setAlertMessage({type:'warning', message:'Some submissions do not have comments. Are you sure you want to submit?'});
            }
        }
    };


    return (
        <div>
            {(isLoading)? <LoadingIcon show={true}/> : <></>}
            { 
                (submissions.length == 0)
                    ? <Alert variant={alertMessage['type']}>{alertMessage['message']}</Alert>
                    : <></>
            }
            {submissions.map(res => 
                <div key={'container-'+res.id}>
                    {
                    (props.bulk_edit)
                    ?<QuickEditSubmission key={'form-'+res.id} id={res.id} submissionDetails={res} onChange={handleFormChange}/>
                    :<SingleSubmission key={res.id} submissionDetails={res}/>
                    }
                </div>)
            }
            
            {
            (calledBy == "upload-submission-grades" & hasError == false)
            ?<Alert variant="success" onClose={() => setShow("hide")} dismissible className={show}>
                Your grade submissions have been submited
            </Alert>
            :<></>
            }

            {
            (calledBy == "upload-submission-grades" & hasError)
            ?<Alert variant="danger" onClose={() => setShow("hide")} dismissible className={show}>
                Opps, something went wrong, please try again
            </Alert>
            :<></>
            }
            <Button onClick={submitForms} className={props.bulk_edit?"visible":"invisible"}>Submit feedback for all students</Button>
        </div>
    );
}
