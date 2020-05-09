import React, {useState} from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { useRequest } from '@umijs/hooks';
import LoadingIcon from '../LoadingIcon';
import { useAlert } from 'react-alert'
import BasicSubmissionView from '../grader/bulk_edit/BasicSubmissionView';

export default function CommentsModal({user_id, assignment_id}){
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const alert = useAlert();

    /**
     * Get all of the submissions that are tasked for this grader from distribution algo 
     */
    const assignedSubmissions = useRequest(url => url, {
        manual: true,
        initialData: [],
        onSuccess: (result, params) => {
        },
        onError: (error, params) => {
            alert.error('Something went wrong when pulling your submissions, please try refreshing the page.')
        }
    });

    /**
     * When the view link is clicked, pull the submissions 
     */
    const handleShow = () => {
        setShow(true)
        assignedSubmissions.run(`${process.env.REACT_APP_BASE_URL}/get-assigned-submissions-for-assigment?user_id=${user_id}&assigment_id=`+assignment_id);
    }

    if(assignedSubmissions.loading) return <LoadingIcon />;
    
    return(
        <>
            <a onClick={handleShow} href="#">
                View
            </a>
            <Modal centered show={show}  animation={false} onHide={handleClose}>
                <Modal.Header closeButton>
                </Modal.Header>
                <Modal.Body>
                    {assignedSubmissions.data.length == 0 ? "This grader has no submissions assigned yet": ""}
                    {assignedSubmissions?.data.map((submission) =>
                        <BasicSubmissionView user_id={submission['name']} is_graded={submission['is_graded']} />
                    )}
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