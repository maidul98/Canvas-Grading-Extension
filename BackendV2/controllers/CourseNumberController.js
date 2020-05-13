const courseNumber = require('../models/CourseNumber')

/**
 * Returns the Course Number. 
 */
module.exports.getCourseNumber = async (_, res) => {
  try {
    let course_number = await courseNumber.getCourseNumber()
    res.send(course_number);
  } catch (error) {
    res.status(406).send(error)
  }
}
