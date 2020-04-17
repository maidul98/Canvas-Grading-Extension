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
                Past comments
            </a>
            <Modal centered show={show}  animation={false} onHide={handleClose}>
                <Modal.Header closeButton>
                </Modal.Header>
                <Modal.Body>
                    {props.comments?.map((comment)=>
                        <div className="comment">
                            <div className="row">
                                <div className="col-sm-2">
                                    <img src={comment?.author.avatar_image_url} alt=""/>
                                </div>
                                <div className="col-sm-10">
                                    <p>{comment.comment}</p>
                                </div>
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