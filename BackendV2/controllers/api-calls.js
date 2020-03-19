/**
 * This file will store all the logic for retrieving and sending data using the 
 * Canvas API. All database querying logic should be put in queries.js.
 */
const axios = require('axios')
const queries = require('./queries');
const qs = require('qs')
const config = {
  //TODO: Factor out bearer tokens into another file that isn't publicly accessible.
  headers: { Authorization: `Bearer 9713~TYz9t4zPXdeHonsL9g19ac3kIucoU8BdskLUNZ1rijvusRvhhdbyQFMhXPDhDltZ` }
};

/** Obtains all the student enrollments for the specific class. */
exports.student_enrollments = function (_, res) {
  try {
    axios.get("https://canvas.cornell.edu/api/v1/courses/15037/enrollments",
      config)
      .then(response => {
        result = []
        response.data.forEach(function (element) {
          if (element.type == "StudentEnrollment") {
            result.push(element);
          };
        });
        res.json(result);
        return result
      })
      .catch(err => res.send(err));
  }
  catch (err) {
    console.error("GG", err);
  }
}

exports.get_published_assignments = function (_, res) {
  axios
    .get('https://canvas.cornell.edu/api/v1/courses/15037/assignments', config)
    .then(result => {
      const assignmentJSONArray = result.data;
      const filtered = assignmentJSONArray.filter(assignment => assignment.published);
      // queries.insertPublishedAssignments(filtered);
      return filtered
    }).then(json => {
      res.json(json);
    })
    .catch(error => console.log(error));
}

exports.get_submissions_for_assignment = function (req, res) {
  axios
    .get(`https://canvas.cornell.edu//api/v1/courses/15037/assignments/${req.params.assignment_id}/submissions`, config)
    .then(result => {
      const submissionsJSONArray = result.data;
      res.json(submissionsJSONArray);
    })
    .catch(error => console.log(error));
}

exports.get_assignments_table = function (req, res) {
  axios
    .get(`https://canvas.cornell.edu//api/v1/courses/15037/assignments/${req.params.assignment_id}/submissions`, config)
    .then(result => {
      const submissionsJSONArray = result.data;
      res.json(submissionsJSONArray);
    })
    .catch(error => console.log(error));
}

exports.get_all_graders = function (_, res) {
  axios
    .get("https://canvas.cornell.edu/api/v1/courses/15037/enrollments",
      config)
    .then(response => {
      result = []
      response.data.forEach(function (element) {
        //TaEnrollment - TAs
        //DesignerEnrollment - Consultants
        //ObserverEnrollment - Graders
        if (element.type === "TaEnrollment" || element.type === "DesignerEnrollment" || element.type === "ObserverEnrollment") {
          result.push(element);
        };
      });
      return result
    })
    .then(jsonarr => {
      queries.insertAllGraders(jsonarr);
      return jsonarr
    })
    .then(resj => {
      res.json(resj)
    })
    .catch(err => res.send(err));
}

exports.grade_single_submission = function (req, res) {

  let formData = {
    'comment[text_comment]': req.body.comment,
    'comment[group_comment]': req.body.is_group_comment,
    'submission[posted_grade]': req.body.assigned_grade
  }

  let headerData = {
    headers: {
      'Accept': 'application/json',
      "Authorization": `Bearer 9713~TYz9t4zPXdeHonsL9g19ac3kIucoU8BdskLUNZ1rijvusRvhhdbyQFMhXPDhDltZ`
    }
  }
  axios
    .put(`https://canvas.cornell.edu/api/v1/courses/15037/assignments/${req.params.assignment_id}/submissions/${req.params.user_id}`, qs.stringify(formData), headerData)
    .then(r => {
      res.send('done');
    })
    .catch(err => console.log(err));
}

/** Sample json in req.body:
 *[
    {
      "id": 2278,
      "comment": "Update1",
      "is_group_comment": false,
      "assigned_grade": 89.89
    },
    {
      "id": 59714,
      "comment": "Update2",
      "is_group_comment": false,
      "assigned_grade": 80.00
    }
  ]
 */
exports.grade_batch_submissions = function (req, res) {
  let formData = {}
  req.body.forEach(j => {
    console.log(j)
    formData[`grade_data[${j.id}][text_comment]`] = j.comment;
    formData[`grade_data[${j.id}][group_comment]`] = j.is_group_comment;
    formData[`grade_data[${j.id}][posted_grade]`] = j.assigned_grade;
  });
  console.log(formData)
  let headerData = {
    headers: {
      'Accept': 'application/json',
      "Authorization": `Bearer 9713~TYz9t4zPXdeHonsL9g19ac3kIucoU8BdskLUNZ1rijvusRvhhdbyQFMhXPDhDltZ`
    }
  }

  axios
    .post(`https://canvas.cornell.edu/api/v1/courses/15037/assignments/${req.params.assignment_id}/submissions/update_grades`, qs.stringify(formData), headerData)
    .then(result => {
      res.send('success')
    })
    .catch(err => console.log(err));
}
