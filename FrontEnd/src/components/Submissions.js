import React, {useEffect, useState, useRef} from 'react';
import LoadingIcon from './LoadingIcon';
import Button from 'react-bootstrap/Button';
import { useRequest } from '@umijs/hooks';
import { Link } from 'react-router-dom';
import { useAlert } from 'react-alert'
import Spinner from 'react-bootstrap/Spinner'

export default function Submissions(props){
    const alert = useAlert();
    const gradesAndComments = useRef([]);
    const [changed, setChanged] = useState(false);  
    const gradeInput = useRef()

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
            gradesAndComments.current = []
            alert.success('Your feedback has been submitted successfully')
        },
        onError: (error, params) => {
            alert.error('Something went wrong, your feedback ws not submitted, please try again in 40 seconds')
        }
    });

    
    useEffect(()=>{
        assignedSubmissions.run('/get-assigned-submissions-for-assigment?user_id=1&assigment_id='+props.assignment_id);
    }, [props.assignment_id]);
    
    
    const handleCommentGrade = (id, event, type) => {
        //if you change grade, then attach any comments for that sub id
        //if you change comment, then add 

        let found = gradesAndComments.current.some(submissionInArray=> submissionInArray.id == id)
        if(found){
            let index = gradesAndComments.current.findIndex(submissionInArray => submissionInArray.id == id);
            gradesAndComments.current[index][type == 'grade'? "assigned_grade": 'comment']=event.target.value
        }else{
            gradesAndComments.current.push({
                'id':id,
                'assigned_grade': document.querySelector(`[data-grade='${id}']`).value,
                'comment': document.querySelector(`[data-comment='${id}']`).value,
                'is_group_comment': false
            })
        }
    };

    /**
     * Submit the quick edit grades for only the submissions for which the grade has changed
     */
    const submitForms = () => {
        if(Object.keys(gradesAndComments)){
            submitGrades.run(
                {
                    url: 'upload-submission-grades/assignments/'+props.assignment_id+'/submissions/batch-update-grades',
                    method: 'post',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(gradesAndComments.current),
                }
            )
        }
    }

    if(submitGrades?.loading | assignedSubmissions?.loading) return <LoadingIcon />

    return (
        <div>
            {console.log(singleSubmissionFetch?.fetches)}
            {Object.values(singleSubmissionFetch?.fetches).map(res => 
                <div key={res.data.id}>
                    {/* {console.log(res.data?.submission_comments)} */}
                    {
                    (props.bulk_edit)
                    ?
                    // Quick edit
                    <div className="quick-edit-submission">
                        <div id="name-grade-container">
                            <div id="student_name">
                                {res.data?.user?.login_id}
                            </div>
                            <div id="grade_input">
                                <span className="out-of-text">Grade out of 100</span>
                                <input type="text" data-grade={res.data.user_id} ref={input => gradeInput.current = input} name="assigned_grade" defaultValue={res.data.score} onChange={(event)=>handleCommentGrade(res.data.user_id, event, 'grade')} type="number" min={0} max={100}></input>
                            </div>
                        </div>
                        <textarea name="comment" data-comment={res.data.user_id} type="text" defaultValue={res.data?.submission_comments.length ? res.data?.submission_comments[res.data?.submission_comments?.length-1].comment:null} placeholder="Enter feedback here" className="feedback-form"  onChange={(event)=>handleCommentGrade(res.data.user_id, event, 'comment')}></textarea>
                        <p className={changed?'auto-save-show':'auto-save-hidden'}>Auto saved, not submitted</p>
                    </div>
                    :
                    // List view
                    <div className="assignment">
                        <div className="student-name">
                            {res.loading? <Spinner animation="grow" />: <></>}
                            <Link to={"/assignments/"+res.data.assignment_id+'/'+res.data.user_id}>
                                {res.data?.user?.login_id}
                            </Link>
                        </div>
                        {res.data?.score == null | res.data?.score == undefined
                        ?
                        <div className="grade-status">
                            <div className="grade-icon-red"></div>
                        </div>
                        :
                        <div className="grade-status">
                            <div className="grade-icon"></div>
                        </div>
                        }
                    </div>
                    }
                </div>)
            }
            <Button onClick={submitForms} className={props.bulk_edit?"visible":"invisible"}>Submit feedback</Button>
            <div className="clear-fix"></div>
        </div>
    );
}
