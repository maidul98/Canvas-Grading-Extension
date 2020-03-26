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