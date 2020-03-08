import React, { Component } from 'react';
import Student from './Student';
import StudentList from './StudentList';
import {Link, useHistory} from 'react-router-dom';
import NavigationMenu from './NavigationMenu'


class Assignment extends Component{
    state = {
        id: null, //assignment ID from Canvas
    };

    handleClick = () => {
        this.props.history.push("/students");
    }

    render(){
        const props = this.props;
        const name = props.name;
        const id = props.id;

        return(
            // <div className = "fade">
            //     <Link to={"/students/"+id}>
            //     <button className = "Button fade" id={id} key={id} onClick={this.handleClick}><strong>{name}</strong></button>
            //     </Link>
            // </div>
            <div className="assignment">
                <div className="student-name">
                    <a href="#">Maidul islam</a>
                </div>
                <div className="grade-status">
                    <div className="grade-icon"></div>
                </div>
            </div>
        )
    }
}

export default Assignment;
