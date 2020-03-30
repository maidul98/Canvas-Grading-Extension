import React, {useEffect, useState, useRef} from 'react';
import LoadingIcon from './LoadingIcon';
import Button from 'react-bootstrap/Button';
import { useRequest } from '@umijs/hooks';
import { Link } from 'react-router-dom';
import { useAlert } from 'react-alert'

export default function Submissions(props){
    const alert = useAlert()
    const gradesAndComments = [];
    const [grade, setGrade] = useState(null);
    const [comment, setComment] = useState(null);
    const [changed, setChanged] = useState(false);  

    const gradee = useRef(null)

    console.log(gradee)

    /**
     * Get all of the submissions that are tasked for this grader from distribution algo 
     */
    const assignedSubmissions = useRequest(url => url, {
        manual: true,
        initialData: [],
        onSuccess: (result, params) => {
            if(result.length == 0){
                alert.show('You have no assigned submissions for this assignment yet')
            }else{
                //remove any older alerts
                alert.removeAll()

                //concurrently pull all submission for quick edit
                result.map((submission) =>{
                    singleSubmissionFetch.run(submission['user_id'], submission['name'])
                })

            }
        },
        onError: (error, params) => {
            alert.error('Something went wrong when pulling your submissions, please try refreshing the page.')
        }
    });

    /**
     * Get grades and comments for quick edit 
     */
    const singleSubmissionFetch = useRequest( (user_id, net_id) => {
        return {
            url:"/canvas-api", 
            method:"post", 
            data:{endpoint:`assignments/${props.assignment_id}/submissions/${user_id}?include[]=user&include[]=submission_comments`}
        }
    }, {
        manual: true,
        initialData: [],
        fetchKey: id => id,
        onError: (error, params) => {
            alert.error(`Something went wrong when fetching ${params[1]}'s submission`)
        }
    });

    /**
     * Submit all of the submission edits changed their values 
     */
    const submitGrades = useRequest(url => url, {
        manual: true,
        onSuccess: (result, params) => {
            alert.success('Your feedback has been submitted successfully')
        },
        onError: (error, params) => {
            alert.error('Something went wrong, your feedback ws not submitted, please try again in 40 seconds')
        }
    });

    
    useEffect(()=>{
        assignedSubmissions.run('/get-assigned-submissions-for-assigment?user_id=1&assigment_id='+props.assignment_id);
    }, [props.assignment_id]);
    
    const handleCommentGrade = (newSubmission, event, type) => {
        console.log(type)
        console.log(newSubmission)
        console.log(event.target.value)
        // let found = gradesAndComments.some(submissionInArray=> submissionInArray.id == newSubmission.id)
        // if(found){
        //     let index = gradesAndComments.findIndex(submissionInArray => submissionInArray.id == newSubmission.id);
        //     gradesAndComments[index] = newSubmission;
        // }else{
        //     gradesAndComments.push(newSubmission)
        // }
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

    if(submitGrades?.loading | assignedSubmissions?.loading) return <LoadingIcon />

    return (
        <div>
            {assignedSubmissions?.data.map(res => 
                <div key={res.id}>
                    {
                    (props.bulk_edit)
                    ?
                    // Quick edit
                    <div className="quick-edit-submission">
                        <div id="name-grade-container">
                            <div id="student_name">
                                {res.name}
                            </div>
                            <div id="grade_input">
                                <span className="out-of-text">Grade out of 100</span>
                                <input type="text" name="assigned_grade" value={singleSubmissionFetch.fetches[res['user_id']]?.data['score']} onChange={(event)=>handleCommentGrade(res['user_id'], event, 'grade')} type="number" min={0} max={100}></input>
                            </div>
                        </div>
                        <textarea name="comment" type="text" placeholder="Enter feedback here" className="feedback-form"  onChange={(event)=>handleCommentGrade(res['user_id'], event, 'comment')}></textarea>
                        <p className={changed?'auto-save-show':'auto-save-hidden'}>Auto saved, not submitted</p>
                    </div>
                    :
                    // List view
                    <div className="assignment">
                        <div className="student-name">
                            <Link to={"/assignments/"+res['assignment_id']+'/'+res['user_id']}>
                                {res['name']}
                            </Link>
                        </div>
                        <div className="grade-status">
                            <div className="grade-icon"></div>
                        </div>
                    </div>
                    }
                </div>)
            }
            
            <Button onClick={submitForms} className={props.bulk_edit?"visible":"invisible"}>Submit feedback</Button>
            <div className="clear-fix"></div>
        </div>
    );
}
