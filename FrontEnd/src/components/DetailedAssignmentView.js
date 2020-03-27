import React from 'react';
import ReactDOM from 'react-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // ES6
import Button from 'react-bootstrap/Button'

class DetailedAssignmentView extends React.Component {

  state = {
    assignment_id: this.props.assignment_id,
    student_id: this.props.student_id,
    submissions: [],
  }

  async componentDidMount(){
    // let url = '/get-submissions/'+this.state.assignment_id;
    // let submissions = await fetch(url).then(resp=>resp.json());
    // let files = []
    // if(submissions[0].attachments){
    //   submissions[0].attachments.forEach(d=>{
    //     files.push(d);
    //   })
    // }
    // this.setState({submissions:files});
  }

  download(event){

  }

  async submit(){

  }

  render(){
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
                <span>Grade our of 100</span>
                <input type="text"/>
              </div>
              <textarea id="detiledAssignmentComment" placeholder="Enter your text feedback here" cols="30" rows="10"></textarea>
            </div>
          </div>
          <Button className="float-right" id="gradeSubmitBtn" variant="primary">Submit feedback</Button>
          <div className="clearfix"></div>
      </div>
    )
  }

}


ReactDOM.render(<DetailedAssignmentView/>, document.getElementById('root'));

export default DetailedAssignmentView;
