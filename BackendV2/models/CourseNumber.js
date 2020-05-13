const pool = require('../pool');

/**
 * Gets the Course Number
 */
module.exports.getCourseNumber = async function () {
  let promisePool = pool.promise();
  let query = "SELECT course_number FROM course";
  const num = await promisePool.query(query);
  return num
}