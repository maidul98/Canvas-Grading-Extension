/**
 * This file will store all the logic for retrieving and sending data using the 
 * Canvas API. All database querying logic should be put in queries.js.
 */
const axios = require('axios');
const queries = require('./queries');
const qs = require('qs');
const http = require('http');
const fs = require('fs');


const config = {
    //TODO: Factor out bearer tokens into another file that isn't publicly accessible.
    headers: { Authorization: 'Bearer 9713~8gLsbC5WwTWOwqv8U3RPK4KK0wcgFThoufCz7fsCwXKsM00w9jKRcqFsbAo8HvJJ' },
};

/** Obtains all the student enrollments for the specific class. */
exports.student_enrollments = function (_, res) {
    try {
        axios.get('https://canvas.cornell.edu/api/v1/courses/15037/enrollments',
            config)
            .then(response => {
                result = [];
                response.data.forEach(function (element) {
                    if (element.type == 'StudentEnrollment') {
                        result.push(element);
                    }
                });
                res.json(result);
                return result;
            })
            .catch(err => res.send(err));
    }
    catch (err) {
        console.error('GG', err);
    }
};

/** Downloads a specific user's single submission for a specific assignment. */
exports.download_single_submission = function (req, res) {
    axios
        .get(`https://canvas.cornell.edu/api/v1/courses/15037/assignments/${req.params.assignment_id}/submissions`, config)
        .then(result => {
            const submissionsJSONArray = result.data;

            var url;

            for (var i = 0; i < Object.keys(submissionsJSONArray).length; i++) {
                if (submissionsJSONArray[i].user_id == req.params.user_id)
                    url = submissionsJSONArray[i].attachments[0].url;
            }
            res.redirect(url);
        })
        .catch(error => console.log(error));
};



exports.get_published_assignments = function (_, res) {
    axios
        .get('https://canvas.cornell.edu/api/v1/courses/15037/assignments', config)
        .then(result => {
            const assignmentJSONArray = result.data;
            const filtered = assignmentJSONArray.filter(assignment => assignment.published);
            // queries.insertPublishedAssignments(filtered);
            return filtered;
        }).then(json => {
            res.json(json);
        })
        .catch(error => console.log(error));
};

exports.get_submissions_for_assignment = function (req, res) {
    // console.log('hey')
    // res.status(400);
    // res.send('None shall pass');
    axios
        .get(`https://canvas.cornell.edu/api/v1/courses/15037/assignments/${req.params.assignment_id}/submissions?include[]=group&include[]=submission_comments`, config)
        .then(result => {
            const submissionsJSONArray = result.data;
            res.json(submissionsJSONArray);
        })
        .catch(error => console.log(error));
};

exports.get_assignments_table = function (req, res) {
    axios
        .get(`https://canvas.cornell.edu/api/v1/courses/15037/assignments/${req.params.assignment_id}/submissions`, config)
        .then(result => {
            const submissionsJSONArray = result.data;
            res.json(submissionsJSONArray);
        })
        .catch(error => console.log(error));
};

exports.get_single_submission = function (req, res) {
    axios
        .get(`https://canvas.cornell.edu/api/v1/courses/15037/assignments/${req.params.assignment_id}/submissions/${req.params.user_id}?include[]=user&include[]=submission_comments`, config)
        .then(result => {
            const submissionsJSONArray = result.data;
            res.json(submissionsJSONArray);
        })
        .catch(error => console.log(error));
};

//TODO: Need to change this once we figure out how graders are going to be enrolled.
exports.get_all_graders = function (_, res) {
    axios
        .get('https://canvas.cornell.edu/api/v1/courses/15037/enrollments',
            config)
        .then(response => {
            result = [];
            response.data.forEach(function (element) {
                //TaEnrollment - TAs
                //DesignerEnrollment - Consultants
                //ObserverEnrollment - Graders
                if (element.type === 'TaEnrollment' || element.type === 'DesignerEnrollment' || element.type === 'ObserverEnrollment') {
                    result.push(element);
                }
            });
            return result;
        })
        .then(jsonarr => {
            console.log(jsonarr);
            queries.insertAllGraders(jsonarr);
            return jsonarr;
        })
        .then(resj => {
            res.json(resj);
        })
        .catch(err => res.send(err));
};
/**
 * 
 */
exports.grade_single_submission = function (req, res) {

    let formData = {
        'comment[text_comment]': req.body.comment,
        'comment[group_comment]': req.body.is_group_comment,
        'submission[posted_grade]': req.body.assigned_grade
    };

    let headerData = {
        headers: {
            'Accept': 'application/json',
            'Authorization': 'Bearer 9713~TYz9t4zPXdeHonsL9g19ac3kIucoU8BdskLUNZ1rijvusRvhhdbyQFMhXPDhDltZ'
        }
    };
    axios
        .put(`https://canvas.cornell.edu/api/v1/courses/15037/assignments/${req.params.assignment_id}/submissions/${req.params.user_id}`, qs.stringify(formData), headerData)
        .then(r => {
            res.status(200)
                .send({ status: 'success', data: r.data });
        })
        .catch(err => {
            res.status(400).send({ status: 'Update failed', message: err });
            console.log(err);
        });
};

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
    let formData = {};
    req.body.forEach(j => {
        formData[`grade_data[${j.id}][text_comment]`] = j.comment;
        formData[`grade_data[${j.id}][group_comment]`] = j.is_group_comment;
        formData[`grade_data[${j.id}][posted_grade]`] = j.assigned_grade;
    });

    //header
    let headerData = {
        headers: {
            'Accept': 'application/json',
            'Authorization': 'Bearer 9713~TYz9t4zPXdeHonsL9g19ac3kIucoU8BdskLUNZ1rijvusRvhhdbyQFMhXPDhDltZ'
        }
    };

    console.log(formData)
    //send grades to Canvas
    axios
        .post(`https://canvas.cornell.edu/api/v1/courses/15037/assignments/${req.params.assignment_id}/submissions/update_grades`, qs.stringify(formData), headerData)
        .then(result => {
            res.send({ status: 'success', data: result.data });
        })
        .catch(err => {
            res.status(406)
                .send({ status: 'fail', data: req.body });
        });
};

// Don't touch this for now
exports.pull_submissions_and_update_for_assignment = function (req, res) {
    axios
        .get(`https://canvas.cornell.edu/api/v1/courses/15037/assignments/${req.params.assignment_id}/submissions?include[]=group&include[]=submission_comments&include[]=user`, config)
        .then(response => {
            dbJSON = [];
            visitedGroups = new Set();
            response.data.forEach(element => {
                if (element.workflow_state === 'submitted') {
                    json = {
                        id: element.id,
                        grader_id: element.grader_id,
                        assignment_id: element.assignment_id,
                        is_graded: element.graded_at !== null,
                        updated_at: element.submitted_at,
                        name: element.user.name,
                        user_id: element.user.id
                    };
                    console.log(json);
                    if (element.group.id !== null && !visitedGroups.has(element.group.id)) {
                        visitedGroups.add(element.group.id);
                        dbJSON.push(json);
                    } else if (element.group.id === null) {
                        dbJSON.push(json);
                    }

                }
            });

            queries.insertAllSubmission(dbJSON);

            res.status(200).send({ status: 'success' });
        })
        .catch(err => {
            console.log(err);
            res.status(400).send({ status: 'operation failed' });
        });
};

/**
 * Takes in a API call for Canvas API and returns the result
 * Input: body['endpoint]
 */
exports.GETcanvas_API_call = function (req, res) {
    axios
        .get(`https://canvas.cornell.edu/api/v1/courses/15037/${req.body['endpoint']}`, config)
        .then(result => {
            const submissionsJSONArray = result.data;
            return res.json(submissionsJSONArray);
        })
        .catch(error => {
            console.log("error");
            res.status(406)
                .send({ status: 'fail', data: error });
        });
};

exports.PUTcanvas_API_call = function (req, res) {

    // axios
    //   .put(`https://canvas.cornell.edu/api/v1/courses/15037/${req.body['endpoint']}`, config)
    //   .then(result => {
    //     const submissionsJSONArray = result.data;
    //     return res.json(submissionsJSONArray);
    //   })
    //   .catch(error => {
    //     console.log(error)
    //     res.status(406)
    //       .send({ status: "fail", data: error });
    //   });
};