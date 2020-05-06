import React, {useState, useEffect} from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { useRequest } from '@umijs/hooks';
import BasicSubmissionView from '../grader/bulk_edit/BasicSubmissionView';

export default function CommentsModal(props){
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    /**
     * Get grades and comments for quick edit from canvas
     */
    const singleSubmissionFetch = useRequest( (user_id) => {
        return {
            url:`${process.env.REACT_APP_BASE_URL}/canvas-api`, 
            method:"post", 
            data:{endpoint:`assignments/${props.assignment_id}/submissions/${user_id}?include[]=user&include[]=submission_comments`}
        }
    }, {
        manual: true,
        initialData: [],
        fetchKey: id => id,
        onError: (error, params) => {
            alert.error(`Something went wrong when fetching ${params[1]}'s submission`)
        }
    });

    useEffect(()=>{
        // singleSubmissionFetch.run(props.user_id)
    }, [])

    return(
        <>
            <a onClick={handleShow} href="#">
                View
            </a>
            <Modal centered show={show}  animation={false} onHide={handleClose}>
                <Modal.Header closeButton>
                </Modal.Header>
                <Modal.Body>
                    {/* {props.attachments?.map((attachment)=>
                        <div className="row">
                            <div className="col-sm-2">
                                <a href={attachment.url}>
                                    <img src="https://img.icons8.com/ios/50/000000/download.png" alt=""/>
                                </a>
                            </div>
                            <div className="col-sm-10">
                                <p className="vir-center-download-img" ><a href={attachment.url}>{attachment.filename}</a></p>
                            </div>
                        </div>
                    )} */}
                </Modal.Body>
                <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Close
                </Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}