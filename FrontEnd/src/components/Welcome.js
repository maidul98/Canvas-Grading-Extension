import React, {useEffect, useCallback } from 'react';
import { useAlert } from 'react-alert'
export default function Welcome(props){
    const alert = useAlert();

    /**
     * Get the get params
     * @param {*} parameterName 
     */
    function findGetParameter(parameterName) {
        var result = null,
            tmp = [];
        props.location.search
            .substr(1)
            .split("&")
            .forEach(function (item) {
              tmp = item.split("=");
              if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
            });
        return result;
    }
    useEffect(()=>{
        let message = findGetParameter('message');
        console.log(message)
        if(message != null){
            alert.info(message)
        }
    }, [])
    return(
        <div>
            {console.log(findGetParameter('message'))}
            <div className="container">
                <div id="welcome_text_conatiner">
                    <div id="textboxcenter">
                        <p> Welcome to Canvas Grading Extension</p>
                        <p>Please login using your Cornell email account</p>
                        <a href={`${process.env.REACT_APP_BASE_URL}/auth/google`} id="login-link">Login</a>
                    </div>
                </div>
            </div>
        </div>
    );
}
