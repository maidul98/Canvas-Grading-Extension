var express = require('express');
const axios = require('axios')
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'HelloWorld' });
  const config = {
    headers: { Authorization: `Bearer 9713~TYz9t4zPXdeHonsL9g19ac3kIucoU8BdskLUNZ1rijvusRvhhdbyQFMhXPDhDltZ` }
  };
  try {
    axios.get("https://canvas.cornell.edu/api/v1/courses/15037/enrollments",
      config)
      .then(response => console.log(response.data),
        JSON.parse(response.data).forEach(function (element) {
          console.log(element.user)
        })
      )
      .catch(err => res.send(err));
  }
  catch (err) {
    console.error("GG", err);
  }
});

router.get('/get-enrollments', function (req, res) {
  // const config = {
  //   headers: { Authorization: `Bearer 9713~TYz9t4zPXdeHonsL9g19ac3kIucoU8BdskLUNZ1rijvusRvhhdbyQFMhXPDhDltZ` }
  // };
  // try {
  //   axios.get("https://canvas.cornell.edu/api/v1/courses/15037/enrollments",
  //     config)
  //     .then(data => console.log(data))
  //     .catch(err => res.send(err));
  // }
  // catch (err) {
  //   console.error("GG", err);
  // }
  return 'hello';
})

router.post('/distribute', function (req, res) {
  //Algorithm
});

module.exports = router;
