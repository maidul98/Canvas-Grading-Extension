const submission = require('../models/Submission')

/**
 * Takes in req.query.assigment_id, req.query.user_id and returns an
 * array of submissions assigned for this user and assignment.
 */
module.exports.assigned = async (req, res) => {
    try{
        let user;
        if(req.user.role == "PROFESSOR"){
            user = req.query.user_id
        }else{
            user = req.user.id
        }

        let submissions = await submission.get_assigned(req.query.assigment_id, req.query.user_id)

        res.send(submissions);
    }catch(error){
        res.status(406).send(error)
    }
}

/**
 * Get all assignment_ids and their name
 */
module.exports.getAllAssignments = async (req, res) => {
    try{
        let assignments = await submission.getAllAssignments();
        res.send(assignments);
    }catch(error){
        res.status(406).send(error)
    }
}
