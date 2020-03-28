import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useRequest } from '@umijs/hooks';

export default function SingleSubmission({submissionDetails}){ 
    console.log(submissionDetails)
    return(
        <div>
            <div className="assignment">
                <div className="student-name">
                    <Link to={"/assignments/"+submissionDetails['assignment_id']+'/'+submissionDetails['user_id']}>
                        {submissionDetails['name']}
                    </Link>
                </div>
                <div className="grade-status">
                    <div className="grade-icon"></div>
                </div>
            </div>
        </div>
    )
}
