import React, { Component, useEffect, useState} from 'react';
import { useRequest } from '@umijs/hooks';
import LoadingIcon from './LoadingIcon';
import Button from 'react-bootstrap/Button';
import Submissions from './Submissions';
import Spinner from 'react-bootstrap/Spinner'
let FileSaver = require('file-saver');

export default function AssignmentList(props) {
    const [assignments, setAssignments] = useState([]);
    const [bulk_edit, setBulk_edit]     = useState(false);
    const [current_assignment_id, setCurrent_assignment_id] = useState(0);
    const [showControls, setShowControls] = useState(false)

    /**
     * 
     */
    const fetchAssignments = useRequest(url => url, {
        manual: true,
        onSuccess: (result, params) => {
            let reOrdered = result.sort(function compare(a, b) {
                var dateA = new Date(a.due_at);
                var dateB = new Date(b.due_at);
                return dateB-dateA;
            });
            setAssignments(reOrdered);
        },
        formatResult: []
    });

    /**
     * 
     */
    const downloadBulkSubmissions = useRequest(()=>{
        return fetch('/download-submission', {
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            responseType: 'arraybuffer', // add this line 
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ "assignment_id":93965, "user_ids": [59709, 59714, 22778], "grader_id": 1 }) // body data type must match "Content-Type" header
        })
    },{
        manual: true,
        onSuccess: async (response, params) => {
            let zip = await response.blob()
            FileSaver.saveAs(zip, "Submissions.zip");
        },
    });

    useEffect(()=>{
        fetchAssignments.run('/get-published-assignments');
    },[]);

    if(fetchAssignments.loading) return <LoadingIcon />;

    return (
        <div className="container">
            <div className="content-container">
                {
                    showControls
                    ?
                    <>
                        <Button variant="secondary" disabled={fetchAssignments.loading} className="float-right" size="lg" onClick={()=>setBulk_edit(!bulk_edit)} >{bulk_edit?'Switch to simple edit':'Bulk edit'}</Button>
                        <Button id="download-buttn" disabled={downloadBulkSubmissions.loading?true:false} variant="outline-secondary" className="float-right" size="lg" onClick={()=>{downloadBulkSubmissions.run()} }> 
                            Download
                            {
                                downloadBulkSubmissions.loading
                                ?
                                <Spinner id="downloadBtnSpinner" as="span"animation="border"size="sm"role="status"aria-hidden="true"/>
                                :
                                <></>

                            }
                        </Button>
                    </>
                    :
                    <></>
                }
                <div className="clear-fix"></div>
                <div id="select-assignment">
                    <select id="dropdown-assignment-selector" onChange={ e => setCurrent_assignment_id(e.target.value)}>
                        {assignments.map((res)=> <option key={res.id} value={res.id}>{res.name}</option>)}
                    </select>
                </div>
                <div className="assignments-container">
                    <Submissions key={current_assignment_id} assignment_id={current_assignment_id} bulk_edit={bulk_edit} showControls={setShowControls}/>
                </div>
            </div>
        </div>
    );
}


