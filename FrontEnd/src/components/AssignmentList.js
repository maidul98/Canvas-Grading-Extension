import React, { Component, useEffect, useState} from 'react';
import { useRequest } from '@umijs/hooks';
import SingleSubmission from './SingleSubmission';
import Form from './QuickEditSubmission';
import Alert from 'react-bootstrap/Alert';
import LoadingIcon from './LoadingIcon';
import { useFetch } from '../useFetch';
import Button from 'react-bootstrap/Button';
import Submissions from './Submissions';

export default function AssignmentList(props) {
    const [assignments, setAssignments] = useState([]);
    const [bulk_edit, setBulk_edit]     = useState(false);
    const [current_assignment_id, setCurrent_assignment_id] = useState(0);
    const { data, isLoading, hasError} = useFetch('/get-published-assignments',[]);

    // const { run, fetches } = useRequest({ url: '/get-published-assignments', method: 'get' }, {
    //     fetchKey: id => id,
    //     onSuccess: (result, params) => {
    //       console.log("params")
    //     }
    //   });

    // console.log(fetches)
    useEffect(()=>{
        // run({ url: '/get-published-assignments', method: 'get' })
        // console.log(fetches)
        if(Array.isArray(data)){
            let reOrdered = data.sort(function compare(a, b) {
                var dateA = new Date(a.due_at);
                var dateB = new Date(b.due_at);
                return dateB-dateA;
            });
            setAssignments(reOrdered);
        }
    },[data]);

    return (
        <div className="container">
            {(isLoading)? <LoadingIcon show={true}/> : <></>}
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


