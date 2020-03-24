import React, {useEffect, useState} from 'react';

export default function QuickEditSubmission(props){
    const [changed, setChanged] = useState(false);
    const [grade, setGrade] = useState(null);
    const [comment, setComment] = useState(null)

    useEffect(()=>{
        let gradePassBackObj = {
            id:props.submissionDetails.id,
            assigned_grade:grade,
            comment: comment,
            is_group_comment: false
        }
        props.onChange(gradePassBackObj);
    }, [grade, comment])

    return(
        <div className="quick-edit-submission">
            <div id="name-grade-container">
                <div id="student_name">
                    {props.submissionDetails.name}
                </div>
                <div id="grade_input">
                    <span className="out-of-text">Grade out of 100</span>
                    <input type="text" name="assigned_grade" type="number" min={0} max={100} onChange={event => setGrade(event.target.value)}></input>
                </div>
            </div>
            <textarea name="comment" type="text" placeholder="Enter feedback here" className="feedback-form" onChange={event => setComment(event.target.value)}></textarea>
            <p className={changed?'auto-save-show':'auto-save-hidden'}>Auto saved, not submitted</p>
        </div>
    );
}