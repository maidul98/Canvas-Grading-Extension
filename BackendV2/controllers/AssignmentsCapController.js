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
        res.status(406).send();
    }
}