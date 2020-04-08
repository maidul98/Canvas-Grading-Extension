import React, {useEffect, useState} from 'react';
import { useRequest } from '@umijs/hooks';
import Alert from 'react-bootstrap/Alert';
import { useAlert } from 'react-alert'
import LoadingIcon from '../LoadingIcon';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';
import ProgressBar from 'react-bootstrap/ProgressBar';
import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';
import Submissions from '../Submissions';

export default function Dashboard(){
    const alert = useAlert();
    const [assignments, setAssignments] = useState([]);
    const [gradedSubmissions, setGradedSubmissions] = useState({});
    /* graders store the grading progress and total number of assigned submissions for each grader for every assignment
    {
        "grader1_id": {"assignment1_id": {"progress": 0, "total_assigned": 10}, 
                        "assignment2_id": {"progress": 50, "total_assigned": 10}}
    }
    */
    const [graders, setGraders] = useState({});
    const [changed, setChanged] = useState(false);
    const [assignment_id, setAssignmentID] = useState(null);
    /* gradersData (to store user inputs):
    {
        "grader1_id": {"weight": 5}
        "grader2_id": {"weight": 2, "offset": 0}
    }
    */
    const [gradersData, setGradersData] = useState({});
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
            let updatedGraders = result.reduce((obj, grader)=>{
                obj[grader.id] = {};
                return obj;
            }, {})
            setGraders(updatedGraders);
        },
        onError: (error, params) => {
            alert.error('Something went wrong while fetching graders, please try refreshing the page.');
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
            alert.error("Something went wrong while fetching assignments, please try refreshing the page");
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
           alert.error("Something went wrong while fetching graders' progress, please try refreshing the page.")
        }
    })

    const fetchAssignedSubmissions = useRequest( (url, assignmentID) => url, {
        manual: true,
        onSuccess: (results, params) => {
            const assignmentID = params[1];
            let updatedGraders = {...graders}
            Object.keys(graders).forEach(grader=>{
                if(results[grader]){
                    let graded = results[grader].filter(submission=>gradedSubmissions[assignmentID].has(submission));
                    updatedGraders[grader][assignmentID] = {"progress": Math.round(graded.length/results[grader].length*100), "total_assigned": results[grader].length}
                }
            })
            setGraders(updatedGraders);
        },
        onError: (error, params) => {
            alert.error("Something went wrong while fetching graders' progress, please try refreshing the page.");
        }
    })

    const updateGradersData = (grader_id, field, val) => {
        if(val!=""){
            setGradersData({...gradersData, [grader_id]: {...gradersData[grader_id], [field]: parseInt(val)}})
        } else {
            setGradersData({...gradersData, [grader_id]: {...gradersData[grader_id], [field]:""}})
        }
    };

    /**
     * Update the db with weights and offsets for users
     */
    const submitData = useRequest(url => url, {
        manual: true,
        onSuccess: (result, params) => {
            alert.success('Weights and offsets updated successfully');
            setChanged(false);
            setGradersData({});
        },
        onError: (error, params) => {
            alert.error('Something went wrong while submitting changes, please try resubmitting.');

        }
    });

    /* need routes for submitting weights */     
    const submit = () =>{
        let finalData = Object.keys(gradersData)
        .reduce((data, grader_id)=>{
            if(gradersData[grader_id].weight && gradersData[grader_id].weight==""){
                delete gradersData[grader_id].weight;
            }
            if(gradersData[grader_id].offset && gradersData[grader_id].offset==""){
                delete gradersData[grader_id].offset;
            }
            if(gradersData[grader_id].weight || gradersData[grader_id].offset){
                data.push({"id": grader_id, ...gradersData[grader_id]});
            }
            return data;
        }, [])
        console.log(finalData);
        if(finalData.length > 0){
            submitData.run({
                url: "/update-graders-data",
                method: 'post',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(finalData),
            })
        } else {
            setGradersData({});
            alert.show("No changes detected");
        }
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

    if(submitData.loading | fetchAssignments.loading) return <LoadingIcon />;

    return (
        <div className="container">
            <Table bordered hover  id="dashboardTable">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Weights</th>
                        <th>Offsets</th>
                        <th>Total Assigned</th>
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
                            <td className="width-10"><FormControl defaultValue={grader?.weight} placeholder="Enter" type="number" min="0" pattern="[0-9]*" id={grader?.id} onChange={event=>{if(event.target.validity.valid){updateGradersData(grader.id, "weight", event.target.value.trim())}; setChanged(true)}}></FormControl></td>
                            <td className="width-10"><FormControl defaultValue={grader?.offset} placeholder="Enter" type="number" id={grader?.id} onChange={event=>{if(event.target.validity.valid){updateGradersData(grader.id, "offset", event.target.value.trim())}; setChanged(true)}}></FormControl></td>
                            <td className="width-10">
                                {!fetchSubmissions.loading && !fetchAssignedSubmissions.loading?graders[grader?.id][assignment_id]?
                                graders[grader?.id][assignment_id]["total_assigned"]:0
                                :"Loading..."}
                            </td>
                            <td>
                                {!fetchSubmissions.loading && !fetchAssignedSubmissions.loading?graders[grader?.id][assignment_id]?
                                <ProgressBar now={graders[grader?.id][assignment_id]["progress"]} label={`${graders[grader?.id][assignment_id]["progress"]}%`} />
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