import React, {useState, useEffect} from 'react';
import Button from 'react-bootstrap/Button';
import { useRequest } from '@umijs/hooks';
import LoadingIcon from '../LoadingIcon';
import { useAlert } from 'react-alert'

export default function DetailedAssignmentView(props){
    const [downloads, setDownloads] = useState([]);
    const [comments, setComments] = useState('');
    const [user, setUser] = useState([]);
    const [grade, setGrade] = useState(null);
    const alert = useAlert();

    const submitGrades = useRequest(url => url, {
        manual: true,
        onSuccess: (result, params) => {
            alert.success('Your feedback has been submitted successfully')
        },
        onError: (error, params) => {
            alert.error('Something went wrong, your feedback ws not submitted, please try again in 40 second')
        }
    });

    const fetchSubmission = useRequest(url => url, {
        manual: true,
        onSuccess: (result, params) => {
            let latest_comment = result['submission_comments'][result['submission_comments'].length-1]['comment'];
            let attachment = result['attachments'];
            let user = result['user'];
            setDownloads(attachment?attachment:[]);
            setComments(latest_comment?latest_comment:[]);
            setUser(user?user:[]);
            setGrade(result['score']);
        },
        onError: (error, params) => {
            alert.error('Something went wrong, when fetching this page')
        }
    });

    useEffect(()=>{
        fetchSubmission.run({
            url:`${process.env.REACT_APP_BASE_URL}/canvas-api`, 
            method:'post', 
            data:{endpoint:`assignments/${props.match.params.assignment_id}/submissions/${props.match.params.student_id}?include[]=user&include[]=submission_comments`}
        });
    }, []);


    function handleSubmit(){
        submitGrades.run(
            {
                url: `${process.env.REACT_APP_BASE_URL}/upload-submission-grades/assignments/${props.match.params.assignment_id}/submissions/${props.match.params.student_id}`,
                method: 'put',
                headers: { 'Content-Type': 'application/json' },
                body: {
                    'comment': comments,
                    'assigned_grade': grade,
                    'is_group_comment': false,
                },
            }
        );
    }

    if(submitGrades.loading | fetchSubmission.loading) return <LoadingIcon />;

    return (
        <div className="container">
            <div id="assignmentDetails">
                <h2>Grading <em>{user['login_id']}</em> on Homework 2</h2>
            </div>
            <hr></hr>
            <div className="row">
                <div className="col-2">
                    <h6>Files attached</h6>
                    <ul id="download-files">
                        {
                            downloads.map((el) => <a href={el['url']}><li>{el['display_name']}</li></a>)
                        }
                    </ul>
                </div>
                <div className="col-10">
                    <div className="float-right" id="detiledAssignmentGrade">
                        <span>Grade out of 100</span>
                        <input value={grade || ''} onChange={event => setGrade(event.target.value)} type="text"/>
                    </div>
                    <textarea id="detiledAssignmentComment" placeholder="Enter your text feedback here" value={comments || ''} onChange={event => setComments(event.target.value)} cols="30" rows="10">heheh</textarea>
                </div>
            </div>
            <div className="clearfix"></div>
            <Button className="float-right" id="gradeSubmitBtn" onClick={handleSubmit} variant="primary">Submit feedback</Button>
            <div className="clearfix"></div>
        </div>
    );

}
