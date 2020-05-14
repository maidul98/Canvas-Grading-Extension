const grader = require('../models/Grader');

/**
 */
module.exports.addCanvasToken = async (req, res) => {
    try{
        grader_array = await grader.updateCanvasToken(req.user.id, req.body.token);
        res.send('Token as been encrypted and saved');
    }catch(error){
        res.status(500).send(error.message);
    }
};