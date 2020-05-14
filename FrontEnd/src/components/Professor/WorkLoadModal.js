import React, {useState} from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { useRequest } from '@umijs/hooks';
import LoadingIcon from '../LoadingIcon';
import { useAlert } from 'react-alert';
import BasicSubmissionView from '../grader/bulk_edit/BasicSubmissionView';
import config from '../../config';

export default function CommentsModal({user_id, assignment_id}){
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const alert = useAlert();
    const [submissions, setSubmissions] = useState([]);

    /**
     * Get all of the submissions that are tasked for this grader from distribution algo 
     */
    const assignedSubmissions = useRequest(async ()=>{
        return fetch(`${config.backend.url}/get-assigned-submissions-for-assigment?user_id=${user_id}&assigment_id=`+assignment_id, config.header);
    }, {
        manual: true,
        initialData: [],
        onSuccess: async (response) => {
            let data = await response.json();
            setSubmissions(data);
        },
        onError: () => {
            alert.error('Something went wrong when pulling your submissions, please try refreshing the page.');
        }
    });


    /**
     * When the view link is clicked, pull the submissions 
     */
    const handleShow = () => {
        setShow(true);
        assignedSubmissions.run();
    };

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
                    {submissions.length == 0 ? 'This grader has no submissions assigned yet': ''}
                    {submissions.map((submission) =>
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
    );
}