const pool = require('../pool');



/**
 * Returns the assigned submissions for every grader for an assignment:
 * {grader1_id: [submission1_id, submission2_id], grader2_id: [submission3_id, submission4_id]}
 * @param {*} req 
 * @param {*} res 
 */
module.exports.get_assigned = function (assigment_id, user_id) {
    return new Promise(function(reslove, reject){
        let sql_query = "SELECT * FROM submission WHERE assignment_id=? AND grader_id=?";
        pool.query(
            sql_query, [assigment_id, user_id],
            function (err, results) {
            if (err) {
                reject(err)
            } else {
                reslove(results)
            }
            }
        );
    });
  }