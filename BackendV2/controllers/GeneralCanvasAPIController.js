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