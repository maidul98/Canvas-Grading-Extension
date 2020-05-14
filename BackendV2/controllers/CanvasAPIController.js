const axios = require('axios');
const grader = require('../models/Grader');

/**
 * Takes in a API call for Canvas API and returns the result
 * Input: body['endpoint]
 */
exports.GET_all = async function (req, res) {
    try{
        let configForCanvasReq = await grader.getCanvasReqConfig(req.user.id);
        let result = await axios.get(`https://canvas.cornell.edu/api/v1/courses/${configForCanvasReq.course_id}/${req.body.endpoint}`, configForCanvasReq.token);
        res.json(result.data);
    }catch(error){
    // console.log(error)
        if(error.type == 'CGE'){
            res.status(400).send(error.message);
        }else{
            res.status(500).send('Something went wrong, please try again later');
        }
    }
};