import React, {useEffect, useState} from 'react';
import { useRequest } from '@umijs/hooks';
import Alert from 'react-bootstrap/Alert';
import LoadingIcon from '../LoadingIcon';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table'
import ProgressBar from 'react-bootstrap/ProgressBar'
import InputGroup from 'react-bootstrap/InputGroup'
import FormControl from 'react-bootstrap/FormControl'

export default function Dashboard(){
    const [assignments, setAssignments] = useState([]);
    const [changed, setChanged] = useState(false);
    const [graders, setGraders] = useState([]);
    const [gradersData, setGradersData] = useState([]);
    /* weights obj:
    {
        grader_id: weight
        123: 2,
    }
    */
    const [weights, setWeights] = useState([]);
    const [weightSubmitStatus, setWeightSubmitStatus] = useState([]);
    const [fetchGradersStatus, setFetchGradersStatus] = useState([]);

    const fetchGraders = useRequest(url => url, {
        manual: true,
        onSuccess: (result, params) => {
            if(result.length==0){
                setFetchGradersStatus([{type:"primary", message:"There are no graders yet"}]);
            }
            else{
                setGraders(result.sort());
            }
        },
        onError: (error, params) => {
            setFetchGradersStatus([{type:"warning", message:"Something went wrong while fetching graders, please try refreshing the page."}])
            console.log(error);
        },
        formatResult: []
    })

    /*need the routes for fetching graders' missed assignments and progress*/
    const fetchGradersData = useRequest(url => url, {
        manual: true,
        onSuccess: (result, params) => {
            if(result.length==0){
                setFetchGradersStatus([{type:"primary", message:"There are no graders yet"}]);
            }
            setGradersData(result)
        },
        onError: (error, params) => {
            setFetchGradersStatus([{type:"warning", message:"Something went wrong while fetching graders, please try refreshing the page."}])
            console.log(error);
        },
        formatResult: []
    })
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
            console.log(error)
        },
        formatResult: []
    });

    const handleChange = (event) => {
        setWeights({...weights, [event.target.id] : event.target.value})
        console.log(weights);
    }

    const submitWeights = useRequest(url => url, {
        manual: true,
        onSuccess: (result, params) => {
            setWeightSubmitStatus({type:"success", message:"Weights updated successfully"});
            setChanged(false);
        },
        onError: (error, params) => {
            setWeightSubmitStatus({type:"warning", message:"Something went wrong, please try again"})
        }
    })

    /* need routes for submitting weights */     
    const submit = () =>{
        /*submitWeights.run({
            url: "",
            method: 'post',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(weights),
        })*/
    }

    useEffect(()=>{
        fetchAssignments.run('/get-published-assignments')
    },[]);

    useEffect(()=>{
        fetchGraders.run('/get-graders')
    }, [])

    if(submitWeights.loading | fetchAssignments.loading | fetchGraders.loading) return <LoadingIcon />

    return (
        <div className="container">
            {weightSubmitStatus.map(status=><Alert variant={status.type}>{status.message}</Alert>)}
            {fetchGradersStatus.map(status=><Alert variant={status.type}>{status.message}</Alert>)}
            <Table bordered hover  id="dashboardTable">
                <thead>
                    <tr>
                    <th>Name</th>
                    <th>Weights</th>
                    <th>Missed</th>
                    <th>
                        <select id="selectAssignments">
                            {assignments.map(assignment=><option value={assignment.id}>Progress for {assignment.name}</option>)}
                        </select>
                    </th>
                    </tr>
                </thead>
                <tbody>
                    {graders.map(grader=>
                        <tr key={grader.user.id}>
                            <td>{grader.user.name}</td>
                            <td className="width-10"><FormControl placeholder="Enter" type="number" id={grader.user.id} onChange={event=>setWeights({...weights, [event.target.id] : event.target.value})}></FormControl></td>
                            <td className="width-10">4</td>
                            <td>
                            <ProgressBar now={30} label={`${30}%`} />
                        </td>
                        </tr>)}
                    {/* <tr>
                        <td>Maidul Islam</td>
                        <td className="width-10"><FormControl placeholder="Enter" type="number" onChange={event=>setChanged(true)}/></td>
                        <td className="width-10">4</td>
                        <td>
                            <ProgressBar now={30} label={`${30}%`} />
                        </td>
                    </tr>
                    <tr>
                        <td>Maidul Islam</td>
                        <td className="width-10"><FormControl placeholder="Enter" type="number" onChange={event=>setChanged(true)}/></td>
                        <td className="width-10">4</td>
                        <td>
                            <ProgressBar now={30} label={`${30}%`} />
                        </td>
                    </tr> */}
                </tbody>
            </Table>
            <Button onClick={submit} className={changed?"visible":"invisible"}>Save</Button>
        </div>
    )
}