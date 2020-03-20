import React, { Component }  from 'react';
import Alert from 'react-bootstrap/Alert'

export function handleErrors(response) {
    if(!response.ok){
        throw new Error(response.statusText);
    }else{
        return response;
    }
}
