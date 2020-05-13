const axios = require('axios');
const grade = require('../models/Grade');
const qs = require('qs');
const grader = require('../models/Grader');

/**
 * Marks submissions as graded and sends them to Canvas 
 */
exports.batchGrade = async function (req, res) {
    try {
        let canvasReqConfig = await grader.getCanvasReqConfig(req.user.id)
        let formData = {};
        let submission_ids = []
        
        req.body.forEach(j => {
        formData[`grade_data[${j.id}][text_comment]`] = j.comment;
        formData[`grade_data[${j.id}][group_comment]`] = j.is_group_comment;
        formData[`grade_data[${j.id}][posted_grade]`] = j.assigned_grade;
        submission_ids.push(j.id)
        });

        await grade.set_assignments_as_graded(submission_ids, req.params.assignment_id)
        await axios.post(`https://canvas.cornell.edu/api/v1/courses/15037/assignments/${req.params.assignment_id}/submissions/update_grades`, qs.stringify(formData), canvasReqConfig)
        res.send();
    } catch (error) {
      return res.status(500).send(error.message)
    }
  };