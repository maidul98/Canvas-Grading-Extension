import React from 'react';
import ReactDOM from 'react-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // ES6
import DownloadButton from './DownloadButton';

class DetailedAssignmentView extends React.Component {

  state = {
    assignment_id: this.props.assignment_id,
    student_id: this.props.student_id,
    submissions: []
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

  render(){
    
    return (
      <div className="container">
        <div className="content-container">
          <div id="detailed-view-box">
            <div id="attachments">
              <ul id="attachment-downloads">
    {this.state.submissions?this.state.submissions.map(d=>{return <DownloadButton key={d.id} url={d.url} filename={d.filename}/>}):null}
              </ul>
            </div>
            <ReactQuill placeholder="Enter your comments here"/>

            <button className="btn" id="submit-feedback-btn">Submit feedback</button>
            <div className="clearfix"></div>
          </div>
        </div>
      </div>
    )
  }

}


ReactDOM.render(<DetailedAssignmentView/>, document.getElementById('root'));

export default DetailedAssignmentView;

