import React, {useState, useEffect, useRef} from 'react';
import Button from 'react-bootstrap/Button';
import { useRequest } from '@umijs/hooks';
import LoadingIcon from '../LoadingIcon';
import { useAlert } from 'react-alert'
import ExtendedSubmissionView from './bulk_edit/ExtendedSubmissionView'
import config from '../../config'
import axios from 'axios'

export default function DetailedAssignmentView(props){
    const alert = useAlert();
    const gradesAndComments = useRef([]);
    const gradeInput = useRef();

    /**
     * Get grades and comments for quick edit from canvass
    */
    const singleSubmissionFetch = useRequest(()=>{
        return axios({
        url:`/api/canvas-api`,
        method:'POST',
        data:{endpoint:`assignments/${props.match.params.assignment_id}/submissions/${props.match.params.student_id}?include[]=user&include[]=submission_comments`},
        })
    }, {
        manual: true,
        initialData: [],
        fetchKey: id => id,
        formatResult: [],
        onError: (error, params) => {
            alert.error(error.response.data)
        }
    });

    /**
     * Submit all of the submission edits changed their values 
     */
    const submitGrades = useRequest(()=>{
        return axios(`/api/upload-submission-grades/assignments/${props.match.params.assignment_id}/submissions/batch-update-grades`,{
            method:"post",
            data: gradesAndComments.current
        })
    }, {
        manual: true,
        onSuccess: async (response, params) => {
            gradesAndComments.current = []
            alert.success(response.data)
        },
        onError: (error, params) => {
            alert.error(error.response.data)
        }
    });

    /**
     * On mount fetch the submission details
     */
    useEffect(()=>{
        console.log(props)
        singleSubmissionFetch.run()
    }, []);
    
    
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
            submitGrades.run()
        }
    }

    return (
        <div class="container">
            <ExtendedSubmissionView data={singleSubmissionFetch.data?.data} gradeInput={gradeInput} handleCommentGrade={handleCommentGrade}/>
            <Button onClick={submitForms} className={`float-right`}>Submit feedback</Button>
            <div className="clear-fix"></div>
        </div>
    );

}
