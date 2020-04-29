import React from 'react';
import { Link } from 'react-router-dom';
import Spinner from 'react-bootstrap/Spinner'

export default function BasicSubmissionView(props){
    return(
        <div className="assignment">
            <div className="student-name">
                {props.data.loading? <Spinner animation="grow" />: <></>}
                {/* <Link to={"/assignments/"+props.data.data.assignment_id+'/'+props.data.data.user_id}> */}
                    {props.data.data?.user?.login_id}
                {/* </Link> */}
            </div>
            {props.data.data?.score === null | props.data.data?.score === undefined
            ?
            <div className="grade-status">
                <div className="grade-icon-red"></div>
            </div>
            :
            <div className="grade-status">
                <div className="grade-icon"></div>
            </div>
            }
        </div>
    )

}