const axios = require('axios');
const config = {
  //TODO: Factor out bearer tokens into another file that isn't publicly accessible.
  headers: {
    Authorization: 'Bearer 9713~8gLsbC5WwTWOwqv8U3RPK4KK0wcgFThoufCz7fsCwXKsM00w9jKRcqFsbAo8HvJJ',
    'Accept': 'application/json',
  },
};

/**
 * Takes in a API call for Canvas API and returns the result
 * Input: body['endpoint]
 */
exports.GET_all = async function (req, res) {
  console.log(req.body.endpoint)
  try {
    console.log(req.body.endpoint)

    let result = await axios.get(`https://canvas.cornell.edu/api/v1/courses/15037/${req.body.endpoint}`, config)
    res.json(result.data);
  } catch (error) {
    res.status(406).send("Request to Canvas was unsuccessful");
  }
};