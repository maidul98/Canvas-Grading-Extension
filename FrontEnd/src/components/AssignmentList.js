import React, { Component, useEffect, useState} from 'react';
import { useRequest } from '@umijs/hooks';
import LoadingIcon from './LoadingIcon';
import Button from 'react-bootstrap/Button';
import Submissions from './Submissions';
import { useAlert } from 'react-alert';

export default function AssignmentList(props) {
    const alert = useAlert();
    const [assignments, setAssignments] = useState([]);
    const [bulk_edit, setBulk_edit]     = useState(false);
    const [current_assignment_id, setCurrent_assignment_id] = useState(0);

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

    useEffect(()=>{
        fetchAssignments.run('/get-published-assignments');
    },[]);

    if(fetchAssignments.loading) return <LoadingIcon />;

    return (
        <div className="container">
            <div className="content-container">
                <Button variant="dark" className="float-right" size="lg" onClick={()=>setBulk_edit(!bulk_edit)}>{bulk_edit?'Switch to simple edit':'Bulk edit'}</Button>
                <div id="select-assignment">
                    <select id="dropdown-assignment-selector" onChange={e => setCurrent_assignment_id(e.target.value)}>
                        {assignments.map((res)=> <option key={res.id} value={res.id}>{res.name}</option>)}
                    </select>
                </div>
                <div className="assignments-container">
                    <Submissions assignment_id={current_assignment_id} bulk_edit={bulk_edit}/>
                </div>
            </div>
        </div>
    );
}


