import React, {useEffect, useState} from 'react';
import { useRequest } from '@umijs/hooks';
import Alert from 'react-bootstrap/Alert';
import LoadingIcon from '../LoadingIcon';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table'
import ProgressBar from 'react-bootstrap/ProgressBar'

export default function Dashboard(){
    return (
        <div className="container">
            <Table striped bordered hover id="dashboardTable">
                <thead>
                    <tr>
                    <th>Name</th>
                    <th>Weights</th>
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
                        <td>10%</td>
                        <td>
                            <ProgressBar now={30} label={`${30}%`} />
                        </td>
                    </tr>
                    <tr>
                        <td>Bob Flake</td>
                        <td>70%</td>
                        <td>
                            <ProgressBar now={90} label={`${90}%`} />
                        </td>
                    </tr>
                    <tr>
                        <td>Rob cat</td>
                        <td>20%</td>
                        <td>
                            <ProgressBar now={10} label={`${10}%`} />
                        </td>
                    </tr>
                    
                </tbody>
            </Table>
        </div>
    )
}