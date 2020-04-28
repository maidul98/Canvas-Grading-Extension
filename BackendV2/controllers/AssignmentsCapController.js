const grader = require('../models/Grader')
const assignmentsCap = require("../models/AssignmentCap")

/**
 * For each new new assignment, it adds....
 * Input: req.body.assignment_ids (array of ints)
 */
module.exports.populateAssignmentsCapTable = async function (req, res) {
    try {
        let graders = await grader.getAll();
        graders = graders.map(grader => grader.id);
        await assignmentsCap.insertForAssignmentsForUsers(req.body.assignment_ids, graders)
        res.send()
    } catch (error) {
        res.status(406).send(error.message);
    }
}

module.exports.getAssignmentsCap = async (req, res) => {
    try {
        let caps = await assignmentsCap.get_assignment_cap(req.query.assignment_id)
        res.json(caps)
    } catch (error) {
        res.status(406).send(error.message)
    }
}

module.exports.updateAssignmentCap = async (req, res) => {
    try {
        await assignmentsCap.update_caps(req.body.cap, req.body.grader_id, req.body.assignment_id)
        res.send({ success: true })
    } catch (error) {
        res.status(406).send(error.message)
    }
}