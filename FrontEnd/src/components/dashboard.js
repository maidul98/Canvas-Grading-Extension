import React from 'react';
import ReactDOM from 'react-dom';

class Dashboard extends React.Component {

  render(){
    return (
      <div className = "fade">
        <div className="top_bar">
          Canvas Grading Extension
        </div>
        <div className = "mid">
          Name of Student:
        </div>
        <div className = "submit">
            <form>
              <div className = "form_el">
                <label for="grade"> Grade </label>
                <input className = "grade" type="number" min = "0" step="any" id = "grade" name="grade"/>
              </div>
              <div className = "form_el">
                <label for= "comments"> Comments </label>
                <textarea className = "comments" type = "textarea" rows = "5" columns = "20" id = "comments" name = "comments" />
              </div>
              <input type="submit" className = "sub_but" value="Submit"/>
            </form>
        </div>
      </div>
    )
  }

}


ReactDOM.render(<Dashboard/>, document.getElementById('root'));

export default Dashboard;
