
import React, { useRef, useState, useEffect, useContext } from 'react';
import { useRequest } from '@umijs/hooks';
import { useAlert } from 'react-alert'
import LoadingIcon from '../LoadingIcon';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';
import ProgressBar from 'react-bootstrap/ProgressBar'
import FormControl from 'react-bootstrap/FormControl';
import WorkLoadModal from './WorkLoadModal';
import { UserContext } from '../../userContext';
import config from '../../config';
import axios from 'axios';
import Dropdown from 'react-bootstrap/Dropdown'
import DropdownButton from 'react-bootstrap/DropdownButton'

export default function Dashboard() {
    let user = useContext(UserContext)
    const alert = useAlert();
    const [graderEditObject, setGraderEditObject] = useState([]);
    const [assignment_id, setAssignment_id] = useState(null);
    const [assignments, setAssignments] = useState([]);

    /**
     * Get the list of unassigned submissions for seleted assigment 
    */
   const getUngradedsubs = useRequest(() => {
        return axios({ url: `/api/unassigned-submissions/${assignment_id}`})
    }, {
        onSuccess: (data)=>{
            console.log(data)
        },
        onError: (error, params) => {
            alert.error("Something happened when fetching the number of ungraded submissions");
        },
        formatResult: (response) => {
            return {...response.data}
        },
        manual: true,
        initialData: {},
    });

    /**
     * Get the list of assignments from Canvas from which the user can drop down from 
     */
    const fetchAssignmentsList = useRequest(() => {
        return axios(`/api/get-all-assignments`)
    }, {
        onSuccess: (result, params) => {
            if (result[0]?.assignment_id != undefined) {
                fetchGradersData.run(result[0].assignment_id);
                setAssignment_id(result[0].assignment_id);
                setAssignments(result)
            }
        },
        onError: (error, params) => {
            alert.error("Something went wrong while fetching assignments, please try refreshing the page");
        },
        formatResult: (response) => {
            return [...response.data]
        },
        initialData: []
    });

    /**
     * Sync submissions, assigment caps table and assigments with Canvas
     */
    const syncWithCanvas = useRequest(async (type) => {
        return axios(`/api/sync-with-canvas/${type}`)
    }, {
        manual: true,
        onSuccess: (message, params) => {
            alert.success("Synced with canvas complete");
            fetchAssignmentsList.run()
            fetchGradersData.run(assignment_id);
        },
        onError: (error, params) => {
            alert.error(error.response.data);
        },
        formatResult: (response) => {
            return response.data
        },

    });

    /**
     * Get grader detials from DB
     */
    const fetchGradersData = useRequest((assignment_id) => {
        return axios(`/api/get-grader-info?assignment_id=${assignment_id}`)
    }, {
        manual: true,
        onError: (error, params) => {
            alert.error('Something went wrong while fetching graders, please try refreshing the page.');
        },
        onSuccess: (data)=>{
            getUngradedsubs.run();
        },
        formatResult: (response) => {
            return [...response.data]
        },
        initialData: [],
    });

    /**
     * When changes are detected, they are made into an object of the following form 
     * {assignment_id: int id: int weight: int} 
     * @param {obj} event 
     * @param {string} type 
     * @param {int} grader_id 
     */
    function handleUpdate(event, type, grader_id) {
        let oldGraderEditObject = graderEditObject;
        let found = oldGraderEditObject.some(graders => graders.id == grader_id)
        if (found) {
            let index = oldGraderEditObject.findIndex(gradersArray => gradersArray.id == grader_id);
            oldGraderEditObject[index][type] = parseInt(event.target.value)
        } else {
            let new_grader = { id: grader_id };
            new_grader[type] = parseInt(event.target.value);
            new_grader['assignment_id'] = assignment_id;
            oldGraderEditObject.push(new_grader);
        }
        setGraderEditObject([...oldGraderEditObject]);
    }

    /**
     * Run the distrubaion algo
     * @param {*} event 
     */
    const runDisturbation = useRequest(() => {
        return axios({ url: `/api/distribute`, method: 'POST', data: { assignment_id: assignment_id } })
    }, {
        manual: true,
        onSuccess: (result, params) => {
            fetchGradersData.run(assignment_id);
            alert.success('Assignment distributed');
        },
        onError: (error, params) => {
            fetchGradersData.run(assignment_id);
            alert.error(error.response.data);
        },
        initialData: []
    });

    /**
     * Sends the grader object to the backend to be be updated in the database 
     */
    const updateGraderDetails = useRequest(() => {
        return axios({ url: `/api/update-grader-info`, method: 'post', data: graderEditObject })
    }, {
        manual: true,
        onSuccess: (data) => {
            fetchGradersData.run(assignment_id)
            setGraderEditObject([])
            alert.success('Updated changes');
        },
        onError: (error, params) => {
            alert.error("Something happened when saving chages, please try again");
        }
    });


    /**
     * Sets current selected assignment and repulls grader data from DB
     * @param {*} event 
     */
    function handleDropdown(event) {
        if (event.target.value != null) {
            fetchGradersData.run(event.target.value)
            setAssignment_id(event.target.value);
        }
    }

    if (fetchGradersData.loading | updateGraderDetails.loading | fetchAssignmentsList.loading | syncWithCanvas.loading | runDisturbation.loading) return <LoadingIcon />;

    return (
        <div className="container">
            <DropdownButton id="dropdown-basic-button" variant="secondary" className="float-left" title="Sync with Canvas" onSelect={function(evt){syncWithCanvas.run(evt)}}>
                <Dropdown.Item eventKey={'submissions and assignments'} >Sync assignments and submissions</Dropdown.Item>
                <Dropdown.Item eventKey={'graders'}>Sync Graders</Dropdown.Item>
            </DropdownButton>
            <select className="float-right" id="selectAssignmentDropdown" value={assignment_id} onChange={event => handleDropdown(event)}>
                <option >Select assignment</option>
                {
                    assignments.map(assignment =>
                        <option value={assignment.assignment_id} key={assignment.assignment_id}>Progress for {assignment.assignment_name}</option>)
                }
            </select>
            <div className="clearfix"></div>

            <Table bordered hover id="dashboardTable">
                <thead>
                    <tr>
                        <th>NetId</th>
                        <th>Weights</th>
                        <th>Offsets</th>
                        <th>Cap</th>
                        <th>Assigned</th>
                        {user?.role == "PROFESSOR" ? <th>Workload</th> : ''}
                        <th>Progress</th>
                    </tr>
                </thead>
                <tbody>
                    {fetchGradersData.data.map(grader =>
                        <tr key={grader.id}>
                            <td className="width-1">{grader?.name}</td>
                            <td className="width-10">
                                <FormControl defaultValue={grader.weight}
                                    onChange={event => handleUpdate(event, "weight", grader.id)}
                                    placeholder="Enter" type="number" min="0" pattern="[0-9]*" />
                            </td>
                            <td className="width-10">
                                <FormControl defaultValue={grader.offset}
                                    onChange={event => handleUpdate(event, "offset", grader.id)}
                                    placeholder="Enter" type="number" /></td>
                            <td className="width-10">
                                <FormControl defaultValue={grader.cap}
                                    onChange={event => handleUpdate(event, "cap", grader.id)}
                                    placeholder="None" type="number" min="0" pattern="[0-9]*" />
                            </td>
                            <td className="width-1">
                                {grader.total_assigned_for_assignment}
                            </td>
                            {user?.role == "PROFESSOR"
                                ?
                                <td className="width-1">
                                    <WorkLoadModal user_id={grader.id} assignment_id={grader.assignment_id} />
                                </td>
                                :
                                ''
                            }
                            <td className="width-30">
                                <ProgressBar animated now={grader.progress} label={grader.num_graded} />
                            </td>
                        </tr>)
                    }
                </tbody>
            </Table>
            <Button className="float-right" disabled={graderEditObject.length != 0} id="distribute-btn" onClick={(runDisturbation.run)}>
                Distribute <span class="badge badge-pill badge-light">{getUngradedsubs.data?.num_unassigned}</span>
            </Button>
                
            {<Button className="float-right" disabled={graderEditObject.length == 0} onClick={updateGraderDetails.run}>Update</Button>}
        </div>
    );
}