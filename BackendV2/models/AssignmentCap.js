const pool = require('../pool');
//grader modal
var AssignmentGrader = require('../distribution-algorithm/grader-model');

/**
 * 
 * @param {*} assignment_id 
 */
function get_assignment_cap(assignment_id) {
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


/** 
 * Method description
 * @returns A new Promise object
 */
async function get_grader_objects(assignment_id) {
  try{
    let assignment_cap = await get_assignment_cap(assignment_id)
    assignment_cap.sort(function (a, b) {
      if (a.grader_id === b.grader_id) return 0
      return b.grader_id > a.grader_id ? 1 : -1
    })
    
    pool.query("SELECT * FROM grader", (error, results) => {
      if (error) {
        throw error
      } else {
        grader_array = []
        results.forEach(grader => {
          let id = grader.id
          let offset = grader.offset
          let weight = grader.weight
          let graderObj = new AssignmentGrader(id, weight, offset, -1, -1, -1)
          grader_array.push(graderObj)
        })
        grader_array.sort(function (a, b) {
          if (a.id === b.id) return 0
          return b.id > a.id ? 1 : -1
        })

        // IMPORTANT: Assumes grader_array and the response from the assignments_cap
        // are equal in length. This needs to be satisfied by making sure every grader 
        // has an entry for every assignment in assignments_cap table.
        if (grader_array.length != assignment_cap.length) throw Error('you done messed up')
        for (let i = 0; i < grader_array.length; i++) {
          let assigned = assignment_cap[i].total_assigned_for_assignment;
          grader_array[i].update_num_assigned(assigned);
          grader_array[i].update_dist_num_assigned(assigned);
          grader_array[i].update_cap(assignment_cap[i].cap);
        }
        return grader_array
      }
    });
  }catch(error){
    throw error
  }
}