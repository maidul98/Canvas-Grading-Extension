const grader = require('../models/Grader');
const distrbute = require('../distribution-algorithm/distributionPipeline');
const submission = require('../models/Submission');

/**
 * Get weights, net_id, and offset, cap, total assigned for all graders. 
 * Used for professor dashboard.
 */
module.exports.getGraderInfo = async (req, res) => {
    try {
        grader_array = await grader.grader_info(req.query.assignment_id);
        res.send(grader_array);
    } catch (error) {
        res.status(500).send('Something went wrong');
    }
};


/**
 * Returns the number of submissions that have not been assigned any grader 
 * for a specific assignment ID. 
 */
module.exports.getUnassignedSubmissions = async (req, res) => {
    try {
        num_unassigned = await submission.get_unassigned_submissions(req.params.assignment_id);
        res.send({ num_unassigned });
    } catch (error) {
        res.status(406).send(error);
    }
};



/**
 * TODO
 */
module.exports.updateGraderInfo = async (req, res) => {
    try {
        let successMessage = await grader.updateGraderInfo(req.body);
        res.send(successMessage);
    } catch (error) {
        res.status(406).send(error);
    }
};

/**
 * TODO
 */
module.exports.runDisturbation = async (req, res) => {
    try {
        await distrbute.runPipeline(req.body.assignment_id);
        res.send();
    } catch (error) {
        res.status(406).send(error);
    }
};


