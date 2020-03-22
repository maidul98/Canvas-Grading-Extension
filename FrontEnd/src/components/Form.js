import React, { Component, useEffect, useState} from 'react';

function Form(props){
    const [changed, setChanged] = useState(false)

    function handlechange(event){
        if(!changed){
            setChanged(true);
        }
    }

    return(
        <form className="feedback-container">
            <textarea type="text" placeholder="Enter feedback here" name={props.id} className="feedback-form" onChange={handlechange}></textarea>
            <span className={changed?"auto-save-show":"auto-save-hidden"}>Auto saved, not submitted</span>
        </form>
    )
}

export default Form;