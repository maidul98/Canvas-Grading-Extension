import React, { useEffect, useRef, useState, useContext } from 'react';
import LoadingIcon from '../LoadingIcon';
import Button from 'react-bootstrap/Button';
import { useRequest } from '@umijs/hooks';
import { useAlert } from 'react-alert'
import ExtendedSubmissionView from './bulk_edit/ExtendedSubmissionView'
import BasicSubmissionView from './bulk_edit/BasicSubmissionView';
import config from '../../config'
import { UserContext } from '../../userContext';
import axios from 'axios'

export default function Submissions(props) {
    let user = useContext(UserContext)
    const alert = useAlert();
    const gradesAndComments = useRef([]);
    const gradeInput = useRef();

    /**
     * Get all of the submissions that are tasked for this grader from distribution algo 
     */
    const assignedSubmissions = useRequest(() => {
        return axios(`/get-assigned-submissions-for-assigment?user_id=${user?.id}&assigment_id=${props.assignment_id}`)
    }, {
        manual: true,
        onSuccess: async (result, params) => {
            if (result.length == 0) {
                alert.show('You have no assigned submissions for this assignment yet')
                props.showControls(false)
            } else {
                alert.removeAll()
                let user_ids = [] // [user_id, net_id]
                result.map((submission) => {//concurrently pull all submission for quick edit
                    user_ids.push([submission['user_id'], submission['name']])
                    singleSubmissionFetch.run(submission['user_id'], submission['name'])
                });
                let downloadObject = {
                    "assignment_id": props.assignment_id,
                    "user_ids": user_ids,
                    "grader_id": user?.id // will be dynmaic 
                }
                props.setDownloadGraderIds(downloadObject)

                props.showControls(true)
            }
        },
        onError: (error, params) => {
            alert.error('Something went wrong when pulling your submissions, please try refreshing the page.')
        },
        formatResult: (response) => {
            return [...response.data]
        },
        initialData: []
    })

    /**
     * Get grades and comments for quick edit from canvas
    */
    const singleSubmissionFetch = useRequest(async (user_id, netid) => {
        return axios({
            url: `/canvas-api`,
            method: "POST",
            data: { endpoint: `assignments/${props.assignment_id}/submissions/${user_id}?include[]=user&include[]=submission_comments` }
        })
    }, {
        manual: true,
        initialData: [],
        fetchKey: id => id,
        formatResult: [],
        onError: (error, params) => {
            alert.error(`${error.response.data}`)
        },
        formatResult: (response) => {
            return response.data
        }
    });


    /**
     * Submit all of the submission edits changed their values 
     */


    const submitGrades = useRequest(async (user_id, net_id) => {
        return fetch(`/upload-submission-grades/assignments/${props.assignment_id}/submissions/batch-update-grades`, {
            method: "POST",
            credentials: "include",
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                "Access-Control-Allow-Credentials": true
            },
            body: JSON.stringify(gradesAndComments.current)
        })
    }, {
        manual: true,
        onSuccess: async (response, params) => {
            if (response.status == 200) {
                gradesAndComments.current = []
                alert.success('Your feedback has been submitted successfully')
            } else {
                alert.error('Grades were not saved. Please try again or update your Canvas token')
            }
        },
        onError: (error, params) => {
            alert.error('Something went wrong, while processing your request. Please try again in a few minutes')
        }
    });


    useEffect(() => {
        assignedSubmissions.run(`/get-assigned-submissions-for-assigment?user_id=1&assigment_id=` + props.assignment_id);
    }, [props.assignment_id]);


    /**
     * 
     * @param {*} id 
     * @param {*} event 
     * @param {*} type 
     */
    const handleCommentGrade = (id, event, type) => {
        let found = gradesAndComments.current.some(submissionInArray => submissionInArray.id == id)
        if (found) {
            let index = gradesAndComments.current.findIndex(submissionInArray => submissionInArray.id == id);
            gradesAndComments.current[index][type == 'grade' ? "assigned_grade" : 'comment'] = event.target.value
        } else {
            gradesAndComments.current.push({
                'id': id,
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
        if (Object.keys(gradesAndComments)) {
            submitGrades.run()
        }
    }

    return (
        <div>
            {submitGrades?.loading | assignedSubmissions?.loading ? <LoadingIcon /> : null}
            {Object.values(singleSubmissionFetch?.fetches).map(res =>
                <div key={res.data?.id}>
                    {
                        (props.bulk_edit)
                            ?
                            <ExtendedSubmissionView
                                data={res.data}
                                gradeInput={gradeInput}
                                handleCommentGrade={handleCommentGrade}
                            />
                            :
                            <BasicSubmissionView user_id={res?.data?.user?.id} displayName={res?.data?.user?.login_id} assignment_id={res?.data?.assignment_id} is_graded={res?.data?.graded_at} loading={res.loading} />
                    }
                </div>)
            }
            <Button onClick={submitForms} className={`float-right ${props.bulk_edit ? `visible` : `invisible`}`}>Submit feedback</Button>
            <div className="clear-fix"></div>
        </div>
    );
}
