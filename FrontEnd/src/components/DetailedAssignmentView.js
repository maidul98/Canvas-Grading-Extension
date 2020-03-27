import React, {useState, useEffect} from 'react';
import Button from 'react-bootstrap/Button'
import { useRequest } from '@umijs/hooks';
import Alert from 'react-bootstrap/Alert';
export default function DetailedAssignmentView(props){
  const [gradeSubmitStatus, SetGradeSubmitStatus] = useState([])
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
    console.log(props.match.params.assignment_id)
    console.log(props.match.params.student_id)
  }, [])

  function handleSubmit(){
    submitGrades.run(
      {
          url: '/upload-submission-grades/assignments/'+props.match.params.assignment_id+'/submissions/:user_id',
          method: 'post',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
      }
    )
  }

  return (
    <div className="container">
      <div id="assignmentDetails">
        <h2>Grading <em>mi252</em> on Homework 2</h2>
      </div>
      <hr></hr>
        <div className="row">
          <div className="col-2">
            <h6>Files attached</h6>
            <ul id="download-files">
              <a href=""><li>home.js</li></a>
              <a href=""><li>store.js</li></a>
            </ul>
          </div>
          <div className="col-10">
            <div className="float-right" id="detiledAssignmentGrade">
              <span>Grade out of 100</span>
              <input type="text"/>
            </div>
            <textarea id="detiledAssignmentComment" placeholder="Enter your text feedback here" cols="30" rows="10"></textarea>
            {gradeSubmitStatus.map((obj) =><Alert id="alert-detail-submit-error" dismissible variant={obj['type']}>{obj['message']}</Alert>)}
          </div>
        </div>
        <Button className="float-right" id="gradeSubmitBtn" variant="primary">Submit feedback</Button>
        <div className="clearfix"></div>
    </div>
  )

}
