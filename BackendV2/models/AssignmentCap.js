const pool = require("../pool")


/**
 * 
 * @param {*} assignments 
 * @param {*} graders 
 */
module.exports.insertForAssignmentsForUsers = async function (assignments, graders) {
  return new Promise((resolve, reject) => {
    if (assignments === null || graders === null || assignments.length === 0 || graders.length === 0) {
      reject("Graders or Assignments are empty")
    }
    pool.getConnection(function (err, connection) {
      let queries = []
      let queriesData = []
      let query = `INSERT IGNORE INTO assignments_cap SET total_assigned_for_assignment=0, cap=100, grader_id=?, assignment_id=?`;
      assignments.forEach(assignment_id => {
        graders.forEach(async grader_id => {
          queries.push(query);
          queriesData.push(grader_id);
          queriesData.push(assignment_id)
        })
      });

      connection.query(queries.join(';'), queriesData, (err) => {
        if (err) {
          reject(err)
        } else {
          connection.release();
          resolve();
        }
      })
    })
  })
}

module.exports.get_assignment_cap = (assignment_id) => {
  return new Promise((resolve, reject) => {
    let query = `SELECT * from assignments_cap WHERE assignment_id=${assignment_id}`;

    pool.getConnection(function (err, connection) {
      if (err) throw err;
      connection.query(query, (err, results) => {
        if (err) {
          console.log(err)
          reject(err)
        } else {
          resolve(results)
        }
        connection.release();
      })
    });

  })
}

module.exports.update_caps = function (cap, grader_id, assignment_id) {
  let sql_query = "UPDATE assignments_cap SET cap = ?  WHERE grader_id = ? AND assignment_id = ?";

  return new Promise((resolve, reject) => {
    pool.query(
      sql_query, [cap, grader_id, assignment_id],
      function (err, _) {
        if (err) {
          reject(err);
        } else {
          resolve()
        }
      }
    )
  })
}