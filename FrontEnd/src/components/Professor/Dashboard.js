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

    useEffect(()=>{
        fetchAssignments.run('/get-published-assignments')
    },[]);

    return (
        <div className="container">
            <Table bordered hover  id="dashboardTable">
                <thead>
                    <tr>
                    <th>Name</th>
                    <th>Weights</th>
                    <th>Missed</th>
                    <th>
                        <select id="selectAssignments">
                            <option value="volvo">Progres for Homework 1</option>
                            <option value="saab">Saab</option>
                            <option value="mercedes">Mercedes</option>
                            <option value="audi">Audi</option>
                        </select>
                    </th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Maidul Islam</td>
                        <td className="width-10"><FormControl placeholder="Enter" /></td>
                        <td className="width-10">4</td>
                        <td>
                            <ProgressBar now={30} label={`${30}%`} />
                        </td>
                    </tr>
                    <tr>
                        <td>Maidul Islam</td>
                        <td className="width-10"><FormControl placeholder="Enter" /></td>
                        <td className="width-10">4</td>
                        <td>
                            <ProgressBar now={30} label={`${30}%`} />
                        </td>
                    </tr>
                </tbody>
            </Table>
        </div>
    )
}