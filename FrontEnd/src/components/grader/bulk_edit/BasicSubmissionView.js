import React from 'react';
import Spinner from 'react-bootstrap/Spinner';

export default function BasicSubmissionView({displayName, user_id, is_graded, loading, assignment_id}){
    return(
        <div className="assignment">
            <div className="student-name">
                {loading? <Spinner animation="grow" />: <></>}
                {
                    assignment_id?
                        <a href={'/assignments/'+assignment_id+'/'+user_id}>{displayName}</a>
                        :
                        <>{user_id}</>
                }
            </div>
            {is_graded === null | is_graded === undefined | is_graded == 0
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
    );

}