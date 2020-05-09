import React, {useEffect, useRef, useState} from 'react';
import LoadingIcon from '../LoadingIcon';
import Button from 'react-bootstrap/Button';
import { useRequest } from '@umijs/hooks';
import { useAlert } from 'react-alert'
import ExtendedSubmissionView from './bulk_edit/ExtendedSubmissionView'
import BasicSubmissionView from './bulk_edit/BasicSubmissionView'

export default function Submissions(props){
    const alert = useAlert();
    const gradesAndComments = useRef([]);
    const gradeInput = useRef();

    /**
     * Get all of the submissions that are tasked for this grader from distribution algo 
     */
    const assignedSubmissions = useRequest(url => url, {
        manual: true,
        initialData: [],
        onSuccess: (result, params) => {
            console.log(result)
            if(result.length == 0){
                alert.show('You have no assigned submissions for this assignment yet')
                props.showControls(false)
            }else{
                alert.removeAll()
                let user_ids = [] // [user_id, net_id]
                result.map((submission) =>{//concurrently pull all submission for quick edit
                    user_ids.push([submission['user_id'], submission['name']])
                    singleSubmissionFetch.run(submission['user_id'], submission['name'])
                });
                let downloadObject = {
                    "assignment_id":props.assignment_id,
                    "user_ids": user_ids,
                    "grader_id": 1 // will be dynmaic 
                }
                props.setDownloadGraderIds(downloadObject)
                
                props.showControls(true)
            }
        },
        onError: (error, params) => {
            alert.error('Something went wrong when pulling your submissions, please try refreshing the page.')
        }
    });

    /**
     * Get grades and comments for quick edit from canvas
     */
    const singleSubmissionFetch = useRequest( (user_id, net_id) => {
        return {
            url:`${process.env.REACT_APP_BASE_URL}/canvas-api`, 
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
        assignedSubmissions.run(`${process.env.REACT_APP_BASE_URL}/get-assigned-submissions-for-assigment?user_id=1&assigment_id=`+props.assignment_id);
    }, [props.assignment_id]);
    
    
    /**
     * 
     * @param {*} id 
     * @param {*} event 
     * @param {*} type 
     */
    const handleCommentGrade = (id, event, type) => {
        let found = gradesAndComments.current.some(submissionInArray=> submissionInArray.id == id)
        if(found){
            let index = gradesAndComments.current.findIndex(submissionInArray => submissionInArray.id == id);
            gradesAndComments.current[index][type == 'grade'? "assigned_grade": 'comment']=event.target.value
        }else{
            gradesAndComments.current.push({
                'id':id,
                'assigned_grade': document.querySelector(`[data-grade='${id}']`).value,
                'comment': document.querySelector(`[data-comment='${id}']`).value,
                'is_group_comment': false,
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
                    url: `${process.env.REACT_APP_BASE_URL}/upload-submission-grades/assignments/`+props.assignment_id+'/submissions/batch-update-grades',
                    method: 'post',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(gradesAndComments.current),
                }
            )
        }
    }

    return (
        <div>
            {submitGrades?.loading | assignedSubmissions?.loading ? <LoadingIcon />:null}
            {Object.values(singleSubmissionFetch?.fetches).map(res => 
                <div key={res.data.id}>
                    {
                    (props.bulk_edit)
                    ?
                    <ExtendedSubmissionView
                        data={res.data} 
                        gradeInput={gradeInput} 
                        handleCommentGrade={handleCommentGrade}
                    />
                    :
                    <BasicSubmissionView user_id={res?.data?.user?.login_id} assignment_id={res?.data.id} is_graded={res?.data?.grade} loading={res.loading} />
                    }
                </div>)
            }
            <Button onClick={submitForms} className={`float-right ${props.bulk_edit?`visible`:`invisible`}`}>Submit feedback</Button>
            <div className="clear-fix"></div>
        </div>
    );
}
