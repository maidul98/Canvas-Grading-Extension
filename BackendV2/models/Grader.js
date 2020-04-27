const pool = require('../pool');
var async = require('async')

/**
 * Get weights, net_id, and offset, cap, total assigned for all graders. 
 * Used for professor dashboard.
 * @param {*} req 
 * @param {*} res 
 */
module.exports.grader_info = function (assignment_id) {
    return new Promise(function(resolve, reject){
        let sql_query = "SELECT grader.name, grader.id, assignments_cap.cap, grader.offset, assignments_cap.total_assigned_for_assignment, grader.weight FROM grader INNER JOIN assignments_cap ON grader.id=assignments_cap.grader_id WHERE assignments_cap.assignment_id = ?";
        pool.query(sql_query, [assignment_id], (error, results) => {
          if (error) {
            reject(error)
          } else {
            resolve(results);
          }
        }
        );
    })
}

/**
 * Update the set of graders' weight, cap, offset 
 */
module.exports.updateGraderInfo = function (grader_object) {
  return new Promise(function(resolve, reject){
    pool.getConnection(function (err, connection) {
      if (err) {reject(err)}
      let queries = []
      let queriesData = []
      grader_object.map(function (grader) {
        for (const property in grader) {
          switch(property) {
            case 'weight':
              queries.push('UPDATE grader SET weight=? WHERE id=?')
              queriesData.push(grader['weight']);
              queriesData.push(grader['id']);
              break;
            case 'cap':
              queries.push('UPDATE assignments_cap SET cap=? WHERE grader_id=? AND assignment_id=?');
              queriesData.push(grader['cap']);
              queriesData.push(grader['id']);
              queriesData.push(grader['assignment_id']);
              break;
            case 'offset':
              queries.push('UPDATE grader SET offset=? WHERE id=?')
              queriesData.push(grader['offset']);
              queriesData.push(grader['id']);
              break;
            default:
          }
        }
      })
      connection.query(queries.join(';'),queriesData, (err, results) => {
        if (err) {reject(err)}
      });
      connection.release();
      resolve();
    })
  })
}