const pool = require('../pool');

/**
 * Gets the Course Number
 */
module.exports.getCourseNumber = async function () {
  try {
    let promisePool = pool.promise();
    let query = "SELECT course_id FROM course_info";
    const course_num = await promisePool.query(query);
    return course_num[0][0].course_id;
  } catch (error) {
    return new Error("Course number is invalid or empty.");
  }
}