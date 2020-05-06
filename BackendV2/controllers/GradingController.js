const axios = require('axios');
const grade = require('../models/Grade');
const qs = require('qs');
const config = {
  //TODO: Factor out bearer tokens into another file that isn't publicly accessible.
  headers: {
    Authorization: 'Bearer 9713~8gLsbC5WwTWOwqv8U3RPK4KK0wcgFThoufCz7fsCwXKsM00w9jKRcqFsbAo8HvJJ',
    'Accept': 'application/json',
  },
};

/**
 * Marks submissions as graded and sends them to Canvas 
 */
exports.batchGrade = async function (req, res) {
    try {
        let formData = {};
        let submission_ids = []
        req.body.forEach(j => {
        formData[`grade_data[${j.id}][text_comment]`] = j.comment;
        formData[`grade_data[${j.id}][group_comment]`] = j.is_group_comment;
        formData[`grade_data[${j.id}][posted_grade]`] = j.assigned_grade;
        submission_ids.push(j.id)
        });

        await grade.set_assignments_as_graded(submission_ids, req.params.assignment_id)
        await axios.post(`https://canvas.cornell.edu/api/v1/courses/15037/assignments/${req.params.assignment_id}/submissions/update_grades`, qs.stringify(formData), config)
        res.send();
    } catch (error) {
        console.log(error)
      return res.status(406).send(error)
    }
  };