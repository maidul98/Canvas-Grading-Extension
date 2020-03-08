import React from 'react';
import ReactDOM from 'react-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // ES6

class DetailedAssignmentView extends React.Component {
  render(){
    return (
      // <div className = "fade">
      //   <div className = "mid">
      //     Name of Student:
      //   </div>
      //   <div className = "submit">
      //       <form>
      //         <div className = "form_el">
      //           <label for="grade"> Grade </label>
      //           <input className = "grade" type="number" min = "0" step="any" id = "grade" name="grade"/>
      //         </div>
      //         <div className = "form_el">
      //           <label for= "comments"> Comments </label>
      //           <textarea className = "comments" type = "textarea" rows = "5" columns = "20" id = "comments" name = "comments" />
      //         </div>
      //         <input type="submit" className = "sub_but" value="Submit"/>
      //       </form>
      //   </div>
      // </div>

      <div className="container">
        <div className="content-container">
          <div id="detailed-view-box">
            <div id="attachments">
              <ul id="attachment-downloads">
                <li>Download file #1</li>
                <li>Download file #2</li>
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

