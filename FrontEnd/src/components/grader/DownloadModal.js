import React, {useState} from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal'

export default function CommentsModal(props){
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true)

    return(
        <>
            <a onClick={handleShow} href="#">
                Attachments
            </a>
            <Modal centered show={show}  animation={false} onHide={handleClose}>
                <Modal.Header closeButton>
                </Modal.Header>
                <Modal.Body>
                    {props.attachments?.map((attachment)=>
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