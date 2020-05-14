import React, {useEffect, useCallback } from 'react';

export default function Welcome(props){
    return(
        <div>
            {/* {console.log(props)} */}
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
