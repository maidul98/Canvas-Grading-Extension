import React, {useEffect, useCallback, useState} from 'react';
import FormControl from 'react-bootstrap/FormControl';
import Button from 'react-bootstrap/Button';

import {useContext} from 'react'
import { useRequest } from '@umijs/hooks';
import { useAlert } from 'react-alert';
import config from '../config'
import {UserContext} from '../userContext';
import axios from 'axios';

export default function Settings(props){
    const [bearToken, setBearToken] = useState();
    const alert = useAlert();
    let user = useContext(UserContext)


    /**
     * Make request update the token
     */
    const updateCanvasToken = useRequest(()=>{
        return axios({
        url:`${config.backend.url}/update-canvas-token`,
        method:'post',
        data:{'token': bearToken},
        withCredentials: true,
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "Access-Control-Allow-Credentials": true
        }})
    }, {
        manual: true,
        onSuccess: (response, params)=>{
            alert.success(response.data);
        },
        onError: (error, params) => {
            alert.error(error.response.data)
        },
    });

    return(
        <div className="container">
            <p>Your canvas token</p>
            <div className="row">
                <div className="col-sm-8">
                    <FormControl onChange={(event)=>setBearToken(event.target.value)} placeholder={'Paste Canvas token here'} />
                </div>
                <div className="col-sm-4">
                    <Button variant="primary" onClick={updateCanvasToken.run}>Update</Button>
                </div>
            </div>
        </div>
    );
}
