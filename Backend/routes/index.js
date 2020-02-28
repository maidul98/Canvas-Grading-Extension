var express = require('express');
const axios = require('axios')
var router = express.Router();

//TODO: Remove hardcoded constants
//TODO: Figure out what functions we need

/* GET home page. This function should be restored to its original state.*/
router.get('/', function (req, res, next) {
  res.render('index', { title: 'HelloWorld' });
  const config = {
    headers: { Authorization: `Bearer 9713~TYz9t4zPXdeHonsL9g19ac3kIucoU8BdskLUNZ1rijvusRvhhdbyQFMhXPDhDltZ` }
  };
  try {
    axios.get("https://canvas.cornell.edu/api/v1/courses/15037/enrollments",
      config)
      .then(response =>
        response.data.forEach(function (element) {
          console.log(element.user)
        })
      )
      .catch(err => res.send(err));
  }
  catch (err) {
    console.error("GG", err);
  }
});

/* Sets up the endpoint get-enrollments to get all the enrollents from the specified course.
TODO: Change the URL to take in a course ID specified by a variable */

router.get('/get-enrollments', function (req, res) {
  //res.render('index');
  const config = {
    headers: { Authorization: `Bearer 9713~TYz9t4zPXdeHonsL9g19ac3kIucoU8BdskLUNZ1rijvusRvhhdbyQFMhXPDhDltZ` }
  };
  try {
    axios.get("https://canvas.cornell.edu/api/v1/courses/15037/enrollments",
      config)
      .then(response => {
        users = []
        response.data.forEach(d=>users.push(d.user));
        return res.json(users);
      }
       /* response.data.forEach(function (element) {
          console.log(element.user)
        })*/
      )
      .catch(err => res.send(err));
  }
  catch (err) {
    console.error("GG", err);
  }
})

router.post('/distribute', function (req, res) {
  //Algorithm
});

module.exports = router;
