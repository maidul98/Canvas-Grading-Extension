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
    const [assignedSubmissions, setAssignedSubmissions] = useState({});
    const [changed, setChanged] = useState(false);
    const [gradersData, setGradersData] = useState({});
    const [gradersProgress, setGradersProgress] = useState({});
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
            let updatedGradersData = result.reduce((gradersObj, grader)=>{
                const {id, ...data} = grader;
                gradersObj[grader.id] =  data;
                gradersObj[grader.id]["assigned_submissions"] = {};
                gradersObj[grader.id]["progress"] = {};
                return gradersObj;
            }, {})
            setGradersData(updatedGradersData);
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

    const fetchSubmissions = useRequest( (a_id) => {
        return {
            url:'/canvas-api', 
            method:'post', 
            data:{endpoint:`assignments/${a_id}/submissions`}
        }
    }, {
        manual: true,
        onSuccess: (results, params) => {
            gradedSubmissions[assignment_id] = new Set();
            results.filter(submission=>submission.score).forEach(submission=>gradedSubmissions[assignment_id].add(submission.id.toString()));
            setGradedSubmissions(gradedSubmissions);
        },
        onError: (error, params) => {
           console.log(error);
        }
    })

    const fetchTotalAssignedToGraders = useRequest( (url, a_id) => url, {
        manual: true,
        onSuccess: (results, params) => {
            const a_id = params[1];
            let updatedGradersData = {...gradersData};
            Object.keys(gradersData).forEach(gid=>{
                if(results[gid]){
                    updatedGradersData[gid]["assigned_submissions"][a_id] = results[gid];
                }
                else{
                    updatedGradersData[gid]["assigned_submissions"][a_id] = [];
                }
            })
            setGradersData(updatedGradersData);
        },
        onError: (error, params) => {
            console.log(error);
        }
    })

    const calculateGradersProgress = (a_id) => {
        let updatedGradersData = {...gradersData}
        Object.keys(gradersData).forEach(gid=>{
            let assigned_submissions = gradersData[gid]["assigned_submissions"][a_id];
            if(assigned_submissions.length>0){
                let graded = assigned_submissions.filter(submission=>gradedSubmissions[a_id].has(submission));
                updatedGradersData[gid]["progress"][a_id] = Math.round(graded.length/assigned_submissions.length*100);
            }
        })
        setGradersData(updatedGradersData);
    }

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
            let submissionsPromise = fetchSubmissions.run(assignment_id);
            let assignedPromise = fetchTotalAssignedToGraders.run(`/get_number_of_submissions_for_each_grader?assignment_id=${assignment_id}`, assignment_id);
            Promise.all([submissionsPromise, assignedPromise]).then(resp=>{
                calculateGradersProgress(assignment_id)
            })
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
                    {Object.keys(gradersData).map(grader=>
                        gradersData[grader]&&
                        <tr key={grader}>
                            <td>{gradersData[grader]["name"]}</td>
                            <td className="width-10"><FormControl defaultValue={gradersData[grader]["weight"]} placeholder="Enter" type="number" id={grader} onChange={event=>{setWeights({}); setChanged(true);}}></FormControl></td>
                            <td className="width-10"><FormControl defaultValue={gradersData[grader]["offset"]} placeholder="Enter" type="number" id={grader} onChange={event=>{setWeights({}); setChanged(true);}}></FormControl></td>
                            <td>
                                {!fetchSubmissions.loading&&!fetchTotalAssignedToGraders.loading?
                                gradersData[grader]["progress"][assignment_id]?<ProgressBar now={gradersData[grader]["progress"][assignment_id]} label={`${gradersData[grader]["progress"][assignment_id]}%`}/>:
                                <p>No assigned submissions yet</p>:<p>Loading...</p>}
                            </td>
                        </tr>)
                    }
                </tbody>
            </Table>
            <Button onClick={submit} className={changed?'visible':'invisible'}>Save</Button>
        </div>
    );
}