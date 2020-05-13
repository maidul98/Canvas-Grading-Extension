import React, {useEffect, useState} from 'react';
import { useRequest } from '@umijs/hooks';
import LoadingIcon from '../LoadingIcon';
import Button from 'react-bootstrap/Button';
import Submissions from './Submissions';
import Spinner from 'react-bootstrap/Spinner'
import config from '../../config'
let FileSaver = require('file-saver');


export default function AssignmentList(props) {
    const [assignments, setAssignments] = useState([]);
    const [bulk_edit, setBulk_edit]     = useState(false);
    const [current_assignment_id, setCurrent_assignment_id] = useState(0);
    const [showControls, setShowControls] = useState(false);
    const [downloadGraderIds, setDownloadGraderIds] = useState({});

    /**START OF USER AUTH**/
    const [user, setUser] = useState({});
    useEffect(async ()=>{
        let response = await fetch(`${config.backend.url}/user`, config.header);
        if(response.status == 200){
            let userFetched = await response.json();
            setUser(userFetched.user)
        }else{
            if(window.location.pathname != '/'){
                window.location = '/';
            }
        }
    }, [])
    /**END OF USER AUTH**/

    /**
     * Get the list of assignments from Canvas  
     */
    const fetchAssignments = useRequest(()=>{
        return fetch(`${process.env.REACT_APP_BASE_URL}/get-all-assignments`,config.header);
    }, {
        manual: true,
        onSuccess: async (response, params) => {
            let data = await response.json();
            setAssignments(data);
            if(data != []){
                setCurrent_assignment_id(data[0].assignment_id)
            }
        },
        formatResult: []
    });

    /**
     * Takes in a list of users for a assignment ID and returns a blob or
     * returns an error otherwise. 
     */
    const downloadBulkSubmissions = useRequest(()=>{
        return fetch(`${process.env.REACT_APP_BASE_URL}/download-submission`, {
            method: 'POST', 
            responseType: 'arraybuffer', 
            credentials: "include",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                "Access-Control-Allow-Credentials": true
            }, 
            body: JSON.stringify(downloadGraderIds)
        })
    },{
        manual: true,
        onSuccess: async (response, params) => {
            console.log(response)
            let zip = await response.blob();
            FileSaver.saveAs(zip, "Submissions.zip");
        },
    });

    useEffect(()=>{
        fetchAssignments.run();
    },[]);

    if(fetchAssignments.loading) return <LoadingIcon />;

    return (
        <div className="container">
            <div className="content-container">
                {
                    showControls
                    ?
                    <>
                        <Button variant="secondary" disabled={fetchAssignments.loading} className="float-right" size="lg" onClick={()=>setBulk_edit(!bulk_edit)} >{bulk_edit?'Back':'Bulk edit'}</Button>
                        <Button id="download-buttn" disabled={downloadBulkSubmissions.loading?true:false} variant="outline-secondary" className="float-right" size="lg" onClick={()=>{downloadBulkSubmissions.run()} }> 
                            Download
                            {
                                downloadBulkSubmissions.loading
                                ?
                                <Spinner id="downloadBtnSpinner" as="span"animation="border"size="sm"role="status"aria-hidden="true"/>
                                :
                                <></>

                            }
                        </Button>
                    </>
                    :
                    <></>
                }
                <div className="clear-fix"></div>
                <div id="select-assignment">
                    <select id="dropdown-assignment-selector" onChange={ e => setCurrent_assignment_id(e.target.value)}>
                        {assignments.map((res)=> <option key={res.assignment_id} value={res.assignment_id}>{res.assignment_name}</option>)}
                    </select>
                </div>
                <div className="assignments-container">
                    <Submissions
                    setDownloadGraderIds={setDownloadGraderIds} 
                    key={current_assignment_id} 
                    assignment_id={current_assignment_id}
                    bulk_edit={bulk_edit} 
                    showControls={setShowControls}
                    />
                </div>
            </div>
        </div>
    );
}


