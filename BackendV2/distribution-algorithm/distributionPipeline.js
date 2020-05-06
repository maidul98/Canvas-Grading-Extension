/**
 * This file will store the logic behind all the database queries. All functions
 * defined here will deal with retrieving or pushing data from the 
 * MySQL database. 
 */
var AssignmentGrader = require('./grader-model');
var DetectConflictOutput = require('./detectConflictsResult');
var async = require('async')
var distribution = require('./distribution.js');
const pool = require('../pool');
const axios = require('axios');

/**
 * TODO FUNCTION description
 * @param {*} graderArray 
 * @param {*} assignment_id 
 */
async function detect_conflicts(graderArray, assignment_id) {

  let extra_submissions = [];

  //checks to see which graders have num_assigned > cap --> need for re-distribution
  for (let i = 0; i < graderArray.length; i++) {
    surplus = graderArray[i].num_assigned - graderArray[i].cap;
    if (surplus > 0) {
      graderArray[i].update_dist_num_assigned(graderArray[i].cap);
      graderArray[i].update_num_assigned(graderArray[i].cap);
      graderArray[i].incrementOffset(surplus);
      let conflict_array = await handle_conflicts(graderArray[i].grader_id, surplus, assignment_id)
      extra_submissions = extra_submissions.concat(conflict_array);
    }
  }
  return new DetectConflictOutput(graderArray, extra_submissions);
}

/**
 * TODO FUNCTION description
 * @param {*} graderID 
 * @param {*} surplus 
 * @param {*} assignment_id 
 */
function get_surplus_submissions(graderID, surplus, assignment_id) {
  return new Promise(function (resolve, reject) {
    let query = `SELECT * FROM submission WHERE grader_id =? AND assignment_id =? AND is_graded =? ORDER BY id`; // get submissions for this grader
    let surplusArr = []
    let data = [graderID, assignment_id, 0]

    pool.query(query, data, async function (error, results) {
      if (error) { reject(error) }

      let diff_in_graded_assignments = surplus - results.length;
      if (diff_in_graded_assignments > 0)
        return reject("The number of graded assignments exceeds the cap. Please raise the cap by at least " + diff_in_graded_assignments + " assignments.")

      // TO DO: max user connection error here
      for (let i = 0; i < surplus; i++) {
        surplusArr.push(results[i].id)
        await set_surplus_submissions(graderID, results[i].id, assignment_id)
      }
      return resolve(surplusArr)
    });
  })
}

/**
 * TODO FUNCTION description
 * @param {*} graderID 
 * @param {*} submission_id 
 * @param {*} assignment_id 
 */
function set_surplus_submissions(graderID, submission_id, assignment_id) {
  return new Promise(function (resolve, reject) {
    let query = `UPDATE submission SET grader_id = NULL WHERE grader_id =? AND id =? AND assignment_id =?`
    let data = [graderID, submission_id, assignment_id]
    pool.query(query, data, (err, results) => {
      if (err) { return reject(err) }
      return resolve();
    });
  });
}


/**
 * TODO FUNCTION description
 * @param {*} graderID 
 * @param {*} surplus 
 * @param {*} assignment_id 
 */
async function handle_conflicts(graderID, surplus, assignment_id) {
  const submissionArr = await get_surplus_submissions(graderID, surplus, assignment_id)
  return submissionArr
}

/** returns a list of AssignmentGrader objects, which will be input in the 
   * algorithm. 
   * 
   * This method will query a list of all the graders, and create 
   * AssignmentGrader instances for each of those graders with their respective
   * id, current weight and offset, and the curr_assigned initialized to 0. 
   * 
   * @returns A new Promise object
   */
  function get_grader_objects(assignment_id) {
    return new Promise(function (resolve, reject) {
      let query = "SELECT grader.id, assignments_cap.cap, grader.offset, assignments_cap.total_assigned_for_assignment, grader.weight FROM grader INNER JOIN assignments_cap ON grader.id=assignments_cap.grader_id WHERE assignments_cap.assignment_id = ?"
      pool.query(query, [assignment_id], function (error, results) {
        if (error) { reject(error) }
        grader_array = []
        results.forEach(grader => {
          let id = grader.id
          let offset = grader.offset
          let cap = grader.cap
          let weight = grader.weight
          let total_assigned = grader.total_assigned_for_assignment
          let graderObj = new AssignmentGrader(id, weight, offset, total_assigned, total_assigned, cap)
          grader_array.push(graderObj)
        })
        resolve(grader_array)
      })
    });
  }


function runPipeline(assignment_id) {
  return new Promise(async function (resolve, reject) {
    try {
      await pull_submissions_from_canvas(assignment_id)
      let grader_array = await get_grader_objects(assignment_id);
      let submission_json = await get_unassigned_submissions(assignment_id);
      let mapped = submission_json.map(v => v.id);

      //sum of num_assigned 
      let total_num_assigned = grader_array.reduce((total, element) => {
        return total + element.num_assigned;
      }, 0);

      //sum of caps 
      let total_cap = grader_array.reduce((total, element) => {
        return total + element.cap;
      }, 0);

      if (total_cap - total_num_assigned < mapped.length) {
        return reject("The sum of the caps of all graders must exceed the total number of submissions.")
      }
      else {
        let conflicts = await detect_conflicts(grader_array, assignment_id);
        mapped = mapped.concat(conflicts.submissionsArray);
        assignmentsLeft = mapped.length > 0 ? true : false;


        if (assignmentsLeft) {
          let graders_assigned = distribution.main_distribute(mapped.length, conflicts.graderArray);
          let matrix_of_pairs = distribution.formMatchingMatrix(graders_assigned, mapped);

          await update_grader_entries(graders_assigned) //update offsets of graders in DB with output_of_algo

          await assign_submissions_to_grader(matrix_of_pairs) //updates submissions and graders in DB with matrix_of_pairs

          await update_total_assigned(graders_assigned, assignment_id) //update num_assigned of graders in DB with output_of_algo

          return resolve("Successfully distributed (or re-distributed) assignments.")
        } else {
          return resolve("There are currently no assignments to distribute or re-distribute.")
        }
      }
    } catch (error) {
      reject(error)
    }
  })
}






/**
 * This function returns the list of unassigned submissions for a given assignment. 
 */
function get_unassigned_submissions(assignment_id) {
  return new Promise((resolve, reject) => {
    let query = `SELECT * FROM submission WHERE grader_id IS NULL AND assignment_id = ${assignment_id}`;

    pool.getConnection(function (err, connection) {
      if (err) throw err;
      connection.query(query, (err, results) => {
        connection.release();
        if (err) {
          reject(err)
        } else {
          return resolve(results)
        }
      })
    });
  })
}


/**
 * TODO 
 * @param {*} grader_array 
 * @param {*} assignment_id 
 */
function update_total_assigned(grader_array, assignment_id) {
  return new Promise(function (resolve, reject) {
    pool.getConnection(function (err, connection) {
      if (err) { reject(err) }
      async.forEachOf(grader_array, function (grader) {
        let query = "UPDATE assignments_cap SET total_assigned_for_assignment=? WHERE grader_id=? AND assignment_id=?"
        let data = [grader.num_assigned, grader.grader_id, assignment_id]
        connection.query(query, data, (err, results) => {
          if (err) { reject(err) }
        });
      })
      connection.release();
      resolve()
    })
  });
}

/**
 * TODO
 * @param {*} grader_array 
 */
function update_grader_entries(grader_array) {
  return new Promise(function (resolve, reject) {
    pool.getConnection(function (err, connection) {
      if (err) { reject(err) }
      async.forEachOf(grader_array, function (grader) {
        let query = "UPDATE grader SET offset=? WHERE id=?"
        let data = [grader.offset, grader.grader_id]
        connection.query(query, data, (err, results) => {
          if (err) { reject(err) }
        });
      });
      connection.release();
      resolve();
    });
  });
}

/**
 * TODO
 * @param {*} assignment_matrix 
 */
function assign_submissions_to_grader(assignment_matrix) {
  return new Promise(function (resolve, reject) {
    pool.getConnection(function (err, connection) {
      if (err) reject(err);
      async.forEachOf(assignment_matrix, function (pairing) {
        let query = "UPDATE submission SET grader_id = ? WHERE id = ?"
        let data = [pairing[0], pairing[1]]
        connection.query(query, data, (err, results) => {
          if (err) {
            reject(err)
          }
        })
      })
      connection.release();
      resolve();
    });
  })
}

/**
 * Adds new submissions from Canvas by assignment_id into DB
 * @param {int} assignment_id 
 */
function pull_submissions_from_canvas(assignment_id) {
  return new Promise(async function (resolve, reject) {
    const config = {
      headers: {
        Authorization: 'Bearer 9713~8gLsbC5WwTWOwqv8U3RPK4KK0wcgFThoufCz7fsCwXKsM00w9jKRcqFsbAo8HvJJ',
        'Accept': 'application/json',
      },
    };
    let response = await axios.get(`https://canvas.cornell.edu/api/v1/courses/15037/assignments/${assignment_id}/submissions?include[]=group&include[]=submission_comments&include[]=user&per_page=3000`, config)
    dbJSON = [];
    visitedGroups = new Set();
    response.data.forEach(element => {
      if (element.workflow_state === 'submitted') {
        json = {
          id: element.id,
          grader_id: element.grader_id,
          assignment_id: element.assignment_id,
          is_graded: element.graded_at !== null,
          updated_at: element.submitted_at,
          name: element.user.name,
          user_id: element.user.id
        };

        if (element.group.id !== null && !visitedGroups.has(element.group.id)) {
          visitedGroups.add(element.group.id);
          dbJSON.push(json);
        } else if (element.group.id === null) {
          dbJSON.push(json);
        }
      }
    });

    pool.getConnection(function (err, connection) {//add the pulled submissions to the DB
      if (err) throw reject(err);
      dbJSON.forEach(e => {
        let id = e.id;
        let grader_id = e.grader_id;
        let assignment_id = e.assignment_id;
        let is_graded = e.is_graded;
        let last_updated = e.updated_at.replace("T", " ").replace("Z", "");
        let name = e.name;
        let user_id = e.user_id
        let query = "INSERT IGNORE INTO submission (id, grader_id, assignment_id, is_graded, last_updated, name, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)";
        let data = [id, grader_id, assignment_id, is_graded, last_updated, name, user_id]
        connection.query(query, data);
      });
      connection.release();
      resolve()
    })
  })
};

module.exports = {
  runPipeline: runPipeline
}