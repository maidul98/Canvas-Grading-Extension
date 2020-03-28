import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useRequest } from '@umijs/hooks';

export default function SingleSubmission({submissionDetails}){ 
    const [fecthedSubmission, setFecthedSubmission] = useState([])
    const fetchSubmission = useRequest(url => url, {
        manual: true,
        onSuccess: (result, params) => {
            setFecthedSubmission(result)
        },
        onError: (error, params) => {
            console.log(error)
        //   setAlert([...alerts, {type:"warning", message:"Something went wrong, when fetching this page"}])
        }
    });

     
    useEffect(()=>{
        fetchSubmission.run({
          url:"/canvas-api", 
          method:"post", 
          data:{endpoint:`assignments/${submissionDetails['assignment_id']}/submissions/${submissionDetails['id']}?include[]=user&include[]=submission_comments`}
        })
    }, [])
    

    return(
        <div>
            <div className="assignment">
                <div className="student-name">
                    <Link to={"/assignments/"+submissionDetails['assignment_id']+"/"+submissionDetails['id']+'/'+fecthedSubmission['user_id']}>
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
