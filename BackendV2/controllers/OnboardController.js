const canvas = require('../models/Canvas');

/**
 * Adds token for current user if the token is valid
 */
module.exports.addCanvasToken = async (req, res) => {
    try{
        grader_array = await canvas.updateCanvasToken(req.user.id, req.body.token);
        res.send('Token as been encrypted and saved');
    }catch(error){
        if (error.type == 'CGE') {
            res.status(400).send(error.message);
        } else {
            res.status(500).send('Something went wrong, please try again later');
        }
    }
};

/**
 * Takes in a course number
 */
module.exports.addCourseID = async (req, res) => {
    try{
        grader_array = await canvas.updateCourseID(req.body.course_id);
        res.send('Course id saved');
    }catch(error){
        if (error.type == 'CGE') {
            res.status(400).send(error.message);
        } else {
            res.status(500).send('Something went wrong, please try again later');
        }
    }
};