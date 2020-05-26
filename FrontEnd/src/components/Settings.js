import React, {useEffect, useCallback, useState} from 'react';
import FormControl from 'react-bootstrap/FormControl';
import Button from 'react-bootstrap/Button';
import {useContext} from 'react';
import { useRequest } from '@umijs/hooks';
import { useAlert } from 'react-alert';
import config from '../config';
import {UserContext} from '../userContext';
import axios from 'axios';
import LoadingIcon from './LoadingIcon';

export default function Settings(props){
    const [bearToken, setBearToken] = useState(null);
    const [deleteCourseConfirm, setDeleteCourseConfirm] = useState();
    const [courseId, setCourseId] = useState(null);
    const alert = useAlert();
    let user = useContext(UserContext);

    /**
     * Make request update the token
     */
    const updateCanvasToken = useRequest(()=>{
        return axios({
        url:`/api/update-canvas-token`,
        method:'post',
        data:{'token': bearToken}
        })}, {
        manual: true,
        onSuccess: (response, params)=>{
            alert.success(response.data);
        },
        onError: (error, params) => {
            alert.error(error.response.data)
        },
    });

    /**
     * Make request update the token
     */
    const resetCourse = useRequest(()=>{
        return axios({
        url:`/api/delete-data-base`,
        })}, {
        manual: true,
        onSuccess: (response, params)=>{
            alert.success(response.data);
        },
        onError: (error, params) => {
            alert.error("Something went wrong when deleting the course")
        },
    });

    /**
     * Update course id 
     */
    const updateCourse = useRequest(()=>{
        return axios({
        url:`/api/update-course-id`,
        method:'post',
        data: {"course_id":courseId}
        })}, {
        manual: true,
        onSuccess: (response, params)=>{
            alert.success(response.data);
        },
        onError: (error, params) => {
            alert.error(error.response.data)
        },
    });

    /**
     * Update course id 
     */
    const getCourseId = useRequest(()=>{
        return axios({
        url:`/api/get-course-id`
        })}, {
        formatResult:(result)=>{
            return result.data
        }
    });

    /**
     * Make sure the user knows that this is undoable
     * @param {*} event 
     */
    function handleCourseReset(){
        if(deleteCourseConfirm == "DELETE ALL COURSE DATA"){
            resetCourse.run()
        }else{
            alert.info('Your confirm text is incorrect, course not deleted')
        }
    }

    function updateToken(){
        if(bearToken != null){
            updateCanvasToken.run()
        }else{
            alert.info('Please enter a token first')
        }
    }

    if (updateCanvasToken.loading) return <LoadingIcon />;
    
    return(
        <div className="container">
            <section class="setting">
                <div className="row">
                    <div className="col-sm-8">
                        <h4>Your canvas token</h4>
                        <p>Vist Account in account in Canvas then go into settings to generate a token</p>
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-8">
                        <FormControl onChange={(event)=>setBearToken(event.target.value)} placeholder={'Paste Canvas token here'} />
                    </div>
                    <div className="col-sm-4">
                        <Button variant="primary" onClick={updateToken}>Update</Button>
                    </div>
                </div>
            </section>
            {user?.role == "PROFESSOR"?
            <section class="setting">
                <div className="row">
                    <div className="col-sm-8">
                        <h4>Course ID</h4>
                        <p>Link your course ID from Canvas</p>
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-8">
                        <FormControl defaultValue={getCourseId?.data?.course_id} onChange={(event)=>setCourseId(event.target.value)} />
                    </div>
                    <div className="col-sm-4">
                        <Button variant="primary" onClick={updateCourse.run}>Link course</Button>
                    </div>
                </div>
            </section>
            :false
            }
            <section class="setting">
                <div className="row">
                    <div className="col-sm-8">
                        <h4>Reset course data</h4>
                        <p>This will remove graders, submissions and assignments</p>
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-8">
                        <FormControl  onChange={(event)=>setDeleteCourseConfirm(event.target.value)} placeholder={'This change cannot be undone. Confirm by DELETE ALL COURSE DATA to continue'} />
                    </div>
                    <div className="col-sm-4">
                        <Button variant="danger" onClick={handleCourseReset}>Reset course</Button>
                    </div>
                </div>
            </section>

        </div>
    );
}
