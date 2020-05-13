  
import React, {useRef, useState, useEffect} from 'react';
import { useRequest } from '@umijs/hooks';
import { useAlert } from 'react-alert'
import LoadingIcon from '../LoadingIcon';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';
import ProgressBar from 'react-bootstrap/ProgressBar'
import FormControl from 'react-bootstrap/FormControl';
import WorkLoadModal from './WorkLoadModal';
import config from '../../config'

export default function Dashboard(){
    const alert = useAlert();
    const [graderEditObject, setGraderEditObject] = useState([])
    const [assignment_id_list, setAssignment_id_list] = useState([])
    const [assignment_id, setAssignment_id] = useState(null)

    /**START OF USER AUTH**/
    const [user, setUser] = useState({});
    useEffect(async ()=>{
        let response = await fetch(`${config.backend.url}/user`, config.header);
        if(response.status == 200){
            let userFetched = await response.json();
            setUser(userFetched.user)
        }else{
            if(window.location.pathname != '/'){
                window.location = '/';
            }
        }
    }, [])
    /**END OF USER AUTH**/

    /**
     * Get the list of assignments from Canvas from which the user can drop down from 
     */
    const fetchAssignmentsList = useRequest(async ()=>{
        return (await fetch(`${config.backend.url}/get-all-assignments`,config.header)).json();
    }, {
        onSuccess: async (result, params)=>{
            if(result[0]?.assignment_id != undefined){
                fetchGradersData.run(result[0].assignment_id);
                setAssignment_id(result[0].assignment_id); // set current assignment id 
            }

            // If there are new assignments then add them to caps table
            let assignment_id_list = result.map(assignment => assignment.assignment_id)
            setAssignment_id_list(assignment_id_list)
        },
        onError: (error, params) => {
            alert.error("Something went wrong while fetching assignments, please try refreshing the page");
        },
        formatResult: [],
    });

    /**
     * Sync submissions, assigment caps table and assigments with Canvas
     */
    const syncWithCanvas = useRequest(async ()=>{
        return (await fetch(`${config.backend.url}/sync-with-canvas`,config.header)).json();
    },{
        manual:true,
        onSuccess: (result, params) => {
            alert.success("Synced with Canvas");
        },
        onError: (error, params) => {
            alert.error("Something went wrong while while syncing with Canvas");
        },
    });

    /**
     * Get grader detials from DB
     */
    const fetchGradersData = useRequest(async (assignment_id) =>{
        return (await fetch(`${config.backend.url}/get-grader-info?assignment_id=${assignment_id}`,config.header)).json();
    }, {
        manual: true,
        onError: (error, params) => {
            alert.error('Something went wrong while fetching graders, please try refreshing the page.');
        },
        formatResult: (response)=>{
            return [...response]
        },
        initialData:[]
    });

    /**
     * When changes are detected, they are made into an object of the following form 
     * {assignment_id: int id: int weight: int} 
     * @param {obj} event 
     * @param {string} type 
     * @param {int} grader_id 
     */
    function handleUpdate(event, type, grader_id){
        let oldGraderEditObject = graderEditObject;
        let found = oldGraderEditObject.some(graders=> graders.id == grader_id)
        if(found){
            let index = oldGraderEditObject.findIndex(gradersArray => gradersArray.id == grader_id);
            oldGraderEditObject[index][type]=parseInt(event.target.value)
        }else{
            let new_grader = {id:grader_id};
            new_grader[type]=parseInt(event.target.value);
            new_grader['assignment_id']=assignment_id;
            oldGraderEditObject.push(new_grader);
        }
        setGraderEditObject([...oldGraderEditObject]);
    }


    /**
     * Sends the grader object to the backend to be be updated in the database 
     */
    const updateGraderDetails = useRequest(()=>{
        return fetch(`${config.backend.url}/update-grader-info`, {
            method: 'POST', 
            credentials: "include",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                "Access-Control-Allow-Credentials": true
            }, 
            body: JSON.stringify(graderEditObject)
        })
    }, {
        manual: true,
        onSuccess: (result, params)=>{
            fetchGradersData.run(assignment_id)
            setGraderEditObject([])
            alert.success('Updated changes');
        },
        onError: (error, params) => {
            fetchGradersData.run(assignment_id)
            alert.error(error.data);
            setGraderEditObject([])
        },
        initialData: []
    });

    /**
     * Run the distrubaion algo
     * @param {*} event 
     */
    const runDisturbation = useRequest(()=>{
        return fetch(`${config.backend.url}/distribute`, {
            method: 'POST', 
            credentials: "include",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                "Access-Control-Allow-Credentials": true
            }, 
            body: JSON.stringify({assignment_id: assignment_id})
        })
    }, {
        manual: true,
        onSuccess: (result, params)=>{
            fetchGradersData.run(assignment_id);
            alert.success('Assignment distributed');
        },
        onError: (error, params) => {
            fetchGradersData.run(assignment_id);
            alert.error(error.data);
        },
        initialData: []
    });
     

    /**
     * Sets current selected assignment and repulls updates from DB
     * @param {*} event 
     */
    function handleDropdown(event){
        if(event.target.value != null){
            fetchGradersData.run(event.target.value)
            setAssignment_id(event.target.value);
        }
    }

    /**
     * 
     */
    function handleCanvasSync(){
        syncWithCanvas.run();
        fetchAssignmentsList.run();
        fetchGradersData.run(assignment_id)
    }

    if(fetchGradersData.loading | updateGraderDetails.loading | fetchAssignmentsList.loading | syncWithCanvas.loading | runDisturbation.loading) return <LoadingIcon />;

    return (
        <div className="container">
            <Button onClick={handleCanvasSync} variant="secondary">Sync with Canvas</Button>
            <select className="float-right" id="selectAssignmentDropdown" value={assignment_id} onChange={event=>handleDropdown(event)}>
                <option >Select assignment to distribute</option>
                    {
                    fetchAssignmentsList.data.map(assignment=>
                    <option value={assignment.assignment_id} key={assignment.assignment_id}>Progress for {assignment.assignment_name}</option>)
                    }
            </select>
            <div className="clearfix"></div> 

            <Table bordered hover  id="dashboardTable">
                <thead>
                    <tr>
                        <th>NetId</th>
                        <th>Weights</th>
                        <th>Offsets</th>
                        <th>Cap</th>
                        <th>Assigned</th>
                        <th>Workload</th>
                        <th>Progress</th>
                    </tr>
                </thead>
                <tbody>
                    {fetchGradersData.data.map(grader=>
                        <tr key={grader.id}>
                            <td className="width-1">{grader?.name}</td>
                            <td className="width-10">
                                <FormControl defaultValue={grader.weight} 
                                onChange={event=>handleUpdate(event, "weight", grader.id)}
                                placeholder="Enter" type="number" min="0" pattern="[0-9]*"/>
                            </td>
                            <td className="width-10">
                                <FormControl defaultValue={grader.offset} 
                                onChange={event=>handleUpdate(event, "offset", grader.id)}
                                placeholder="Enter" type="number"/></td>
                            <td className="width-10">
                                <FormControl defaultValue={grader.cap} 
                                onChange={event=>handleUpdate(event, "cap", grader.id)}
                                placeholder="None"  type="number" min="0" pattern="[0-9]*" />
                            </td>
                            <td className="width-1">
                                {grader.total_assigned_for_assignment}
                            </td>
                            <td className="width-1">
                                <WorkLoadModal user_id={grader.id} assignment_id={grader.assignment_id}/>
                            </td>
                            <td className="width-30">
                                <ProgressBar animated now={grader.progress} label={grader.num_graded}/>
                            </td>
                        </tr>)
                    }
                </tbody>
            </Table>
            {<Button className="float-right" disabled={graderEditObject.length!=0} id="distribute-btn" onClick={(runDisturbation.run)}>Distribute</Button>}   
            {<Button className="float-right" disabled={graderEditObject.length==0} onClick={updateGraderDetails.run}>Update</Button>}
        </div>
    );
}