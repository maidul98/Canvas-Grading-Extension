/**
 * This file will store all the logic for retrieving and sending data using the 
 * Canvas API. All database querying logic should be put in queries.js.
 */
const axios = require('axios')
const queries = require('./queries');
const qs = require('qs')
const http = require('http')
const fs = require('fs')


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


exports.download_single_submission = function (req, res) {

  /*
    const http = require('http');
    const fs = require('fs');
  
    const file = fs.createWriteStream("file.pdf");
  
    const request = http.get("http://canvas.cornell.edu/files/1232064/download?download_frd=1&verifier=Oq1Xai22llhOx6N9I3koRdGHzDNBhG3JPdQbV9tV", function (response) {
      response.pipe(file);
    });
  */

  // URL = "http://canvas.cornell.edu/files/1232064/download?download_frd=1&verifier=Oq1Xai22llhOx6N9I3koRdGHzDNBhG3JPdQbV9tV"

  axios
    .get(`https://canvas.cornell.edu/api/v1/courses/15037/assignments/${req.params.assignment_id}/submissions`, config)
    .then(result => {
      const submissionsJSONArray = result.data;
      //the first "[0]" represents the appropriate user_id that you want the submission of 
      //which i've hardcoded rn for testing purposes 


      var url = result.data[0].attachments[0].url;
      URL = "http://" + url.substring(8);

      //var url = result.data[0].attachments[0].url.substring(8);

      // res.send(url);


      // const http = require('http');
      // const fs = require('fs');

      // const file = fs.createWriteStream("file.pdf");
      // const request = http.get(url, function (response) {
      //   response.pipe(file);
      // });



      // http.get(URL, function (response) {
      //   response.pipe(file);
      //   file.on('finish', function () {
      //     file.close(cb);  // close() is async, call cb after close completes.
      //   });
      // }).on('error', function (err) { // Handle errors
      //   fs.unlink(dest); // Delete the file async. (But we don't check the result)
      //   if (cb) cb(err.message);
      // })


      http.get(URL, function (file) {
        file.pipe(res);
      });

      // file.on('finish', function () {
      //   file.close(cb);
      // });

    })
    .catch(error => console.log(error));
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
  // console.log('hey')
  // res.status(400);
  // res.send('None shall pass');
  axios
    .get(`https://canvas.cornell.edu/api/v1/courses/15037/assignments/${req.params.assignment_id}/submissions`, config)
    .then(result => {
      const submissionsJSONArray = result.data;
      res.json(submissionsJSONArray);
    })
    .catch(error => console.log(error));
}

exports.get_assignments_table = function (req, res) {
  axios
    .get(`https://canvas.cornell.edu/api/v1/courses/15037/assignments/${req.params.assignment_id}/submissions`, config)
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
