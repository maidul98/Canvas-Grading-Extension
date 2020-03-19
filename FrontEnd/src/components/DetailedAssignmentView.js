import React from 'react';
import ReactDOM from 'react-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // ES6
import Button from './Button';

class DetailedAssignmentView extends React.Component {

  state = {
    assignment_id: this.props.assignment_id,
    student_id: this.props.student_id,
    submissions: [],
    bulk_edit: false
  }

  async componentDidMount(){
    let url = '/get-submissions/'+this.state.assignment_id;
    let submissions = await fetch(url).then(resp=>resp.json());
    let files = []
    if(submissions[0].attachments){
      submissions[0].attachments.forEach(d=>{
        files.push(d);
      })
    }
    this.setState({submissions:files});
  }

  download(event){

  }

  async submit(){

  }

  render(){

    return (
      <div className="container">
        <div className={this.props.bulk_edit?"content-container-bulk-edit":"content-container"}>
          <div id="detailed-view-box">
            <div id="header-container">
              {!this.props.bulk_edit?
              <ul id="attachment-downloads">
                <li><Button url={"#"} title="Download file #1"/></li>
                <li><Button url={"#"} title="Download file #1"/></li>
                <li><Button url={"#"} title="Download file #1"/></li>
                <li><Button url={"#"} title="Download file #1"/></li>
              </ul>:null}
              <div id="enter-grade">
                <div id="grade-box">
                  <input id="grade" max={100} min={0} placeholder="Enter grade" type="text"/>
                  <span id="out-of-text">out of</span>
                  <span id="total-grade">100</span>
                </div>
              </div>
            </div>
            <ReactQuill placeholder="Enter your comments here"/>
            <button className="btn" id="submit-feedback-btn" onClick={this.submit}>Submit feedback</button>
            <div className="clearfix"></div>
          </div>
        </div>
      </div>
    )
  }

}


ReactDOM.render(<DetailedAssignmentView/>, document.getElementById('root'));

export default DetailedAssignmentView;
