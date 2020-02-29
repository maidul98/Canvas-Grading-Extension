/**
 * This file will store all the logic for retrieving and sending data using the 
 * Canvas API. All database querying logic should be put in queries.js.
 */
const axios = require('axios')

exports.student_enrollments = function (req, res, next) {
  const config = {
    headers: { Authorization: `Bearer 9713~TYz9t4zPXdeHonsL9g19ac3kIucoU8BdskLUNZ1rijvusRvhhdbyQFMhXPDhDltZ` }
  };

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
        return res.json(result);
      })
      .catch(err => res.send(err));
  }
  catch (err) {
    console.error("GG", err);
  }
}