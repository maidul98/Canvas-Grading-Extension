const pool = require('../pool');
var encryptor = require('simple-encryptor')(process.env.APP_SECRET_KEY);
const axios = require('axios');

/**
 * Gets the Course Number for internal functions
 */
getCourseNumber = async function () {
    try {
        let promisePool = pool.promise();
        let query = 'SELECT course_id FROM course_info WHERE id =1';
        const [courseId, fields] = await promisePool.query(query);
        if (courseId[0].course_id == null){
            throw{
                type: 'CGE', 
                message: 'Please add the canvas course ID then try again', 
            };
        }
        return courseId[0].course_id

    } catch (error) {
        throw error;
    }
};


/**
 * Gets the Course Number for route
 */
getCourseNumberForRoute = async function () {
    try {
        let promisePool = pool.promise();
        let query = 'SELECT course_id FROM course_info WHERE id =1';
        const [courseId, fields] = await promisePool.query(query);
        return courseId[0].course_id
    } catch (error) {
        throw error;
    }
};

/*
Give the users bear token and canvas course id for Canvas requests.
 */
getCanvasReqConfig = async function (userId) {
    try {
        let courseId = await getCourseNumber();
    
        let promisePool = pool.promise();
        const [bearToken, fields] = await promisePool.query('SELECT c_token from grader where id=?', [userId]);

        if (bearToken[0].c_token == '' | bearToken[0].c_token == null) {
            throw{
                type: 'CGE', 
                message: 'Please add a Canvas Token then try again' 
            };
        }
    
        var decryptedToken = encryptor.decrypt(bearToken[0].c_token);

        let configConstruct = {
            headers: {
                Authorization: `Bearer ${decryptedToken}`,
                'Accept': 'application/json',
            },
        };

        return {'token':configConstruct, 'course_id':courseId};

    } catch (error) {
        throw error;
    }
};


//TODO if the grader is trying to update a token and there is no course id in the DB, then throw error.

/**
 * Validates and updates token
 */
updateCanvasToken = async function (user_id, token) {
    try {
        let courseId = await getCourseNumber();

        let promisePool = pool.promise();
        let canvasReqConfig = {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
        };

        // check if token works
        await axios(`https://canvas.cornell.edu/api/v1/courses/${courseId}/assignments`, canvasReqConfig);

        //encryptor
        var encryptoredToken = encryptor.encrypt(token);
        await promisePool.query('UPDATE grader SET c_token =? WHERE id=?', [encryptoredToken, user_id]);
    } catch (error) {
        throw{
            type: "CGE", 
            message: "Your canvas token may have expired, please try adding a new token and try again" 
          }
    }
};

/**
 * Updates course ID
 */
updateCourseID = async function (course_id) {
    try {
        let promisePool = pool.promise();
        await promisePool.query('UPDATE course_info SET course_id=? WHERE id = 1', [course_id]);
    } catch (error) {
        console.log(error)
        throw{
            type: "CGE", 
            message: "Failed to update course id, please try again" 
          }
    }
}

module.exports = {
    getCourseNumber:getCourseNumber,
    getCanvasReqConfig:getCanvasReqConfig,
    updateCanvasToken:updateCanvasToken,
    updateCourseID:updateCourseID,
    getCourseNumberForRoute:getCourseNumberForRoute
}