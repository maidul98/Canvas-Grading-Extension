const grader = require("../models/Grader");

/**
 * Get weights, net_id, and offset, cap, total assigned for all graders. 
 * Used for professor dashboard.
 */
module.exports.getGraderInfo = async (req, res) => {
    try{
        grader_array = await grader.grader_info(req.query.assignment_id)
        res.send(grader_array)
    }catch(error){
        res.status(500).send("Something went wrong")
    }
}

/**
 * 
 */
module.exports.updateGraderInfo = async (req, res) => {
    try{
        let successMessage = await grader.updateGraderInfo(req.body);
        res.send(successMessage);
    }catch(error){
        res.status(406).send(error)
    }
}


