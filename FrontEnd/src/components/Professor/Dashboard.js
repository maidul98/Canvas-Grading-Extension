import React, {useEffect, useState} from 'react';
import { useRequest } from '@umijs/hooks';
import Alert from 'react-bootstrap/Alert';
import LoadingIcon from '../LoadingIcon';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';
import ProgressBar from 'react-bootstrap/ProgressBar';
import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';

export default function Dashboard(){
    const [assignments, setAssignments] = useState([]);
    const [changed, setChanged] = useState(false);
    const [graders, setGraders] = useState([]);
    const [gradersData, setGradersData] = useState([]);
    const [assignment_id, setAssignmentID] = useState(null);
    /* weights obj:
    {
        grader_id: weight
        123: 2,
    }
    */
    const [weights, setWeights] = useState([]);
    const [weightSubmitStatus, setWeightSubmitStatus] = useState([]);
    const [fetchGradersStatus, setFetchGradersStatus] = useState([]);

    /**
     * Get each graders info such as net_id, weight and progress given an assigment_id 
     */
    const fetchGradersData = useRequest(id => {
        return {
            "url":`/get-grader-info/${id}`,
            "method":'get'
        }
    }, {
        manual: true,
        onSuccess: (result, params) => {
            console.log(result);
        },
        onError: (error, params) => {
            setFetchGradersStatus([{type:'warning', message:'Something went wrong while fetching graders, please try refreshing the page.'}]);
            console.log(error);
        },
        formatResult: []
    });

    /**
     * Get the full list of assignments ordred from new to old
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
        onError: (error, params) => {
            console.log(error);
        },
        formatResult: []
    });

    /**
     * Update weights for a user to the DB
     */
    const submitWeights = useRequest(url => url, {
        manual: true,
        onSuccess: (result, params) => {
            setWeightSubmitStatus({type:'success', message:'Weights updated successfully'});
            setChanged(false);
        },
        onError: (error, params) => {
            setWeightSubmitStatus({type:'warning', message:'Something went wrong, please try again'});
        }
    });

    /* need routes for submitting weights */     
    const submit = () =>{
        /*submitWeights.run({
            url: "",
            method: 'post',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(weights),
        })*/
    };

    useEffect(()=>{
        fetchAssignments.run('/get-published-assignments');

    },[]);


    useEffect(()=>{
        fetchGradersData.run('/get-grading-progress-for-assignment?assignment_id='+assignment_id);
    }, []);

    if(submitWeights.loading | fetchAssignments.loading) return <LoadingIcon />;

    return (
        <div className="container">
            {weightSubmitStatus.map(status=><Alert variant={status.type}>{status.message}</Alert>)}
            {fetchGradersStatus.map(status=><Alert variant={status.type}>{status.message}</Alert>)}
            <Table bordered hover  id="dashboardTable">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Weights</th>
                        <th>Offsets</th>
                        <th>
                            <select id="selectAssignments">
                                {assignments.map(assignment=><option value={assignment.id} key={assignment.id} onChange={event=>{setAssignmentID(assignment.id);}}>Progress for {assignment.name}</option>)}
                            </select>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {fetchGradersData?.data?.map(grader=>
                        <tr key={grader?.id}>
                            <td>{grader?.name}</td>
                            <td className="width-10"><FormControl defaultValue={grader?.weight} placeholder="Enter" type="number" id={grader?.id} onChange={event=>{setWeights({}); setChanged(true);}}></FormControl></td>
                            <td className="width-10"><FormControl defaultValue={grader?.offset} placeholder="Enter" type="number" id={grader?.id} onChange={event=>{setWeights({}); setChanged(true);}}></FormControl></td>
                            <td>
                                <ProgressBar now={30} label={`${30}%`} />
                            </td>
                        </tr>)
                    }
                </tbody>
            </Table>
            <Button onClick={submit} className={changed?'visible':'invisible'}>Save</Button>
        </div>
    );
}