import React from 'react';
import CommentsModal from '../CommentsModal'
import DownloadModal from '../DownloadModal'

export default function ExtendedSubmissionView(props){

    return(
        <div className="quick-edit-submission">
            <div id="name-grade-container">
                <div id="student_name">
                    {props.data?.user?.login_id}
                </div>
                <div id="grade_input">
                    <span className="out-of-text">Grade out of 100</span>
                    <input type="text" data-grade={props.data?.user_id} 
                    ref={input => props.gradeInput.current = input} 
                    name="assigned_grade" defaultValue={props.data?.score} 
                    onChange={(event)=>props.handleCommentGrade(props.data?.user_id, event, 'grade')} 
                    type="number" min={0} max={100}></input>
                </div>
            </div>
            <textarea
            name="comment" 
            data-comment={props.data?.user_id} 
            type="text" 
            placeholder="Enter feedback here" 
            className="feedback-form"  
            onChange={(event)=>props.handleCommentGrade(props.data?.user_id, event, 'comment')}>
            </textarea>
            
            <div className="submission_actions">
                <ul>
                    <li><CommentsModal comments={props.data?.submission_comments}/></li>
                    <li><DownloadModal attachments={props.data?.attachments}/></li>
                </ul>
            </div> 

        </div>
    )

}