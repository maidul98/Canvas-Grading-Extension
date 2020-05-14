const pool = require('../pool');

/**
 * Gets the Course Number
 */
module.exports.getCourseNumber = async function () {
  try {
    let promisePool = pool.promise();
    let query = "SELECT course_id FROM course_info";
    const course_num = await promisePool.query(query);
    if (course_num[0][0].course_id == undefined | course_num[0][0].course_id == ""){
      throw{
        type: "CGE", 
        message: "Please add the ID of the course then try again", 
      }
    }

    return course_num[0][0].course_id;

  } catch (error) {
    throw error
  }
}