import React, { Component, useEffect, useState} from 'react';

function handleForm(){
    
}

function Form(props){
    const [changed, setChanged] = useState(false);

    function handleChange(event){
        if(!changed){
            setChanged(true);
        }
        let field = event.target.name;
        let value = event.target.value;
        props.onChange(props.id, field, value);
    }

    return(
        <form className="feedback-container">
            <textarea name="comment" type="text" placeholder="Enter feedback here" className="feedback-form" onChange={handleChange}></textarea>
            <div className="grade-box-bulk">
                <span className="float-right">Grade out of 100 </span>
                <input name="assigned_grade" className="float-right" type="number" min={0} max={100} id="grade" onChange={handleChange}></input>
            </div>
            <span className={changed?'auto-save-show':'auto-save-hidden'}>Auto saved, not submitted</span>
        </form>
    );
}

export default Form;