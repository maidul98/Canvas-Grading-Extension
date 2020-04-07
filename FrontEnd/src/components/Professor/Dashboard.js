import React, {useEffect, useState} from 'react';
import { useRequest } from '@umijs/hooks';
import Alert from 'react-bootstrap/Alert';
import LoadingIcon from '../LoadingIcon';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';
import ProgressBar from 'react-bootstrap/ProgressBar';
import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';
import Submissions from '../Submissions';

export default function Dashboard(){
    const [assignments, setAssignments] = useState([]);
    const [gradedSubmissions, setGradedSubmissions] = useState({});
    const [gradersProgress, setGradersProgress] = useState({});
    const [changed, setChanged] = useState(false);
    const [assignment_id, setAssignmentID] = useState(null);
    const [weights, setWeights] = useState([]);
    const [weightSubmitStatus, setWeightSubmitStatus] = useState([]);
    const [fetchGradersStatus, setFetchGradersStatus] = useState([]);

    /**
     * Get each graders info such as net_id, weight and progress given an assigment_id 
     */
    const fetchGradersData = useRequest(() => {
        return {
            "url":`/get-grader-info`,
            "method":'get'
        }
    }, {
        manual: true,
        onSuccess: (result, params) => {
            let updatedGradersProgress = result.reduce((obj, grader)=>{
                obj[grader.id] = {};
                return obj;
            }, {})
            setGradersProgress(updatedGradersProgress);
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
            setAssignmentID(reOrdered[0].id)
        },
        onError: (error, params) => {
            console.log(error);
        },
        formatResult: []
    });

    const fetchSubmissions = useRequest( (assignmentID) => {
        return {
            url:'/canvas-api', 
            method:'post', 
            data:{endpoint:`assignments/${assignmentID}/submissions`}
        }
    }, {
        manual: true,
        onSuccess: (results, params) => {
            const assignmentID = params[0];
            gradedSubmissions[assignmentID] = new Set();
            results.filter(submission=>submission.score).forEach(submission=>gradedSubmissions[assignmentID].add(submission.id.toString()));
            setGradedSubmissions(gradedSubmissions);
            fetchAssignedSubmissions.run(`/get-assigned-submissions-for-graders?assignment_id=${assignmentID}`, params[0]);
        },
        onError: (error, params) => {
           console.log(error);
        }
    })

    const fetchAssignedSubmissions = useRequest( (url, assignmentID) => url, {
        manual: true,
        onSuccess: (results, params) => {
            const assignmentID = params[1];
            let updatedGradersProgress = {...gradersProgress}
            Object.keys(gradersProgress).forEach(grader=>{
                if(results[grader]){
                    let graded = results[grader].filter(submission=>gradedSubmissions[assignmentID].has(submission));
                    updatedGradersProgress[grader][assignmentID] = Math.round(graded.length/results[grader].length*100)
                }
            })
            setGradersProgress(updatedGradersProgress);
        },
        onError: (error, params) => {
            console.log(error);
        }
    })

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
        fetchGradersData.run();
    }, []);

    useEffect(()=>{
        if(assignment_id && !gradedSubmissions[assignment_id]){
            fetchSubmissions.run(assignment_id);
        }
    }, [assignment_id])

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
                            <select id="selectAssignments" onChange={event=>setAssignmentID(event.target.value)}>
                                {assignments.map(assignment=><option value={assignment.id} key={assignment.id}>Progress for {assignment.name}</option>)}
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
                                {!fetchSubmissions.loading && !fetchAssignedSubmissions.loading?gradersProgress[grader?.id][assignment_id]?
                                <ProgressBar now={gradersProgress[grader?.id][assignment_id]} label={`${gradersProgress[grader?.id][assignment_id]}%`} />
                                :<p>No assigned submissions yet</p>
                                :<p>Loading...</p>
                                }
                            </td>
                        </tr>)
                    }
                </tbody>
            </Table>
            <Button onClick={submit} className={changed?'visible':'invisible'}>Save</Button>
        </div>
    );
}