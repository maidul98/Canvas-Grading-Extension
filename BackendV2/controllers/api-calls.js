/**
 * This file will store all the logic for retrieving and sending data using the 
 * Canvas API. All database querying logic should be put in queries.js.
 */
const axios = require('axios')
const queries = require('./queries');
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

exports.get_all_graders = function (req, res) {
  axios
    .get("https://canvas.cornell.edu/api/v1/courses/15037/enrollments",
      config)
    .then(response => {
      result = []
      response.data.forEach(function (element) {
        //TaEnrollment - TAs
        //DesignerEnrollment - Consultants
        //ObserverEnrollment - Graders
        if (element.type == "TaEnrollment" || element.type == "DesignerEnrollment" || element.type == "ObserverEnrollment") {
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