  
import React, {useRef, useState} from 'react';
import { useRequest } from '@umijs/hooks';
import { useAlert } from 'react-alert'
import LoadingIcon from '../LoadingIcon';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';
import ProgressBar from 'react-bootstrap/ProgressBar';
import FormControl from 'react-bootstrap/FormControl';
export default function Dashboard(){
    const alert = useAlert();
    const [graderEditObject, setGraderEditObject] = useState([])
    const currentDropdown = useRef("");
    const [assignment_id_list, setAssignment_id_list] = useState([])

    /**
     * Get the list of assignments from Canvas from which the user can drop down from 
     */
    const fetchAssignmentsList = useRequest(`${process.env.REACT_APP_BASE_URL}/get-published-assignments`, {
        onSuccess: (result, params)=>{
            if(result[0].id != undefined){
                fetchGradersData.run(result[0].id);
                currentDropdown.current = result[0].id;
            }
            let assignment_id_list = result.map(assignment => assignment.id)
            setAssignment_id_list(assignment_id_list)
            updateCapsTable.run();
            //if there are new assignments, add them to the caps table 
            // updateCapsTable.run()
        },
        onError: (error, params) => {
            alert.error("Something went wrong while fetching assignments, please try refreshing the page");
        },
        initialData: []
    });

    /**
     * 
     */
    const updateCapsTable = useRequest({
        manual:false,
        url:`${process.env.REACT_APP_BASE_URL}/check-for-new-assignments`,
        method:'post',
        headers: { 'Content-Type': 'application/json' },
        body:JSON.stringify({"assignment_ids": assignment_id_list})
    });

    /**
     * Get grader detials from DB
     */
    const fetchGradersData = useRequest((assignment_id) =>`${process.env.REACT_APP_BASE_URL}/get-grader-info?assignment_id=${assignment_id}`, {
        manual: true,
        onError: (error, params) => {
            alert.error('Something went wrong while fetching graders, please try refreshing the page.');
        },
        initialData: []
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
            new_grader['assignment_id']=currentDropdown.current;
            oldGraderEditObject.push(new_grader);
        }
        setGraderEditObject([...oldGraderEditObject]);
    }

    /**
     * Sends the grader object to the backend to be be updated in the database 
     */
    const updateGraderDetails = useRequest({
        manual:true,
        url:`${process.env.REACT_APP_BASE_URL}/update-grader-info`,
        method:'post',
        headers: { 'Content-Type': 'application/json' },
        body:JSON.stringify(graderEditObject)
    }, {
        manual: true,
        onSuccess: (result, params)=>{
            fetchGradersData.run(currentDropdown.current)
            setGraderEditObject([])
            alert.success('Updated changes');
        },
        onError: (error, params) => {
            alert.error('Something went wrong while fetching graders, please try refreshing the page.');
        },
        initialData: []
    });

    /**
     * Sets current selected assignment and repulls updates from DB
     * @param {*} event 
     */
    function handleDropdown(event){
        fetchGradersData.run(event.target.value)
        currentDropdown.current=event.target.value
    }

    if(fetchGradersData.loading | updateGraderDetails.loading | fetchAssignmentsList | updateCapsTable) return <LoadingIcon />;

    return (
        <div className="container">
            <Table bordered hover  id="dashboardTable">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Weights</th>
                        <th>Offsets</th>
                        <th>Cap</th>
                        <th>Assigned</th>
                        <th>
                        <select id="selectAssignments" value={currentDropdown.current} onChange={event=>handleDropdown(event)}>
                            {
                            fetchAssignmentsList.data.map(assignment=>
                            <option value={assignment.id} key={assignment.id}>Progress for {assignment.name}</option>)
                            }
                        </select>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {fetchGradersData.data.map(grader=>
                        <tr key={grader.id}>
                            <td>{grader?.name}</td>
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
                            <td className="width-10">
                                {grader.total_assigned_for_assignment}
                            </td>
                            <td>

                            </td>
                        </tr>)
                    }
                </tbody>
            </Table>
                {graderEditObject.length? <Button onClick={updateGraderDetails.run}>Update</Button>: <></>}           
        </div>
    );
}