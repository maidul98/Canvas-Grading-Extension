/**
 * ===============================================================================
 * This file will store the logic behind all the database queries. All functions
 * defined here will deal with retrieving or pushing data from the 
 * MySQL database. 
 * ===============================================================================
 */

var AssignmentGrader = require('./grader-model');
var DetectConflictOutput = require('./detectConflictsResult');
var async = require('async')
var distribution = require('./distribution.js');
const pool = require('../pool');
const axios = require('axios');

/**
 * Detects which graders have been assigned a greater number of submissions for 
 * assignment [assignment_id] than their cap values allow. In that case, the helper
 * function [handle_conflicts] unassigns the surplus number of submissions
 * from the appropriate grader. 
 * Returns [graderArray] with the updated values of graders' offsets and the 
 * updated number of submissions that they now have assigned & a set of 
 * submission ID's representing all submissions that now need to be distributed. 
 * @param {Array} graderArray An array of AssignmentGrader objects representing the set of all graders 
 * @param {Number} assignment_id The assignment ID 
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
      let conflict_array = await get_surplus_submissions(graderArray[i].grader_id, surplus, assignment_id);
      extra_submissions = extra_submissions.concat(conflict_array);
    }
  }
  return new DetectConflictOutput(graderArray, extra_submissions);
}

/**
 * Retrives the set of grader [graderID]'s ungraded submissions for [assignment_id],
 * selects the first [surplus] submissions, and unassigns the grader [grdaerID] so 
 * those can be re-distributed. 
 * Returns the submission IDs of the [surplus] submissions that need re-distribution. 
 * If [surplus] exceeds the set of grader [graderID]'s ungraded submissions, then an 
 * error will be thrown. 
 * @param {Number} graderID The grader ID 
 * @param {Number} surplus Number of ungraded submissions that need to be removed and 
 * re-distributed from grader [graderID]'s workload 
 * @param {Number} assignment_id The assignment ID 
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
        return reject("The number of graded assignments exceeds the cap. Please raise the cap by at least " + diff_in_graded_assignments + " assignment(s).")

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
 * Unassigns the submission [submission_id] for assignment [assignment_id]
 * from the grader [graderID], so it can be re-distributed. 
 * @param {Number} graderID The complete set of graders 
 * @param {Number} submission_id The submission ID 
 * @param {Number} assignment_id The assignment ID 
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

/** returns a list of AssignmentGrader objects, which will be input in the 
   * algorithm. 
   * 
   * This method will query a list of all the graders, and create 
   * AssignmentGrader instances for each with their respective ID, offset, and cap. 
   * @param {Number} assignment_id The assignment ID
   * @returns A new Promise object
**/
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


/**
 * Executes the entire distribution pipeline, including pulling unassigned
 * submissions for [assignment_id] & all graders from the DB, detecting any 
 * conflicts, running the distribution algorithm which assigns each grader the 
 * number of submissions they must grade, and assigns the appropriate number of
 * submissions to each grader. The DB is updated. 
 * An error will be thrown if the total number of submissions exceeds the sum 
 * of the caps of all graders.
 * @param {Array} grader_array An array of AssignmentGrader objects representing the set of all graders 
 * @param {Number} assignment_id The assignment ID
 */
function runPipeline(assignment_id) {
  return new Promise(async function (resolve, reject) {
    try {
      let grader_array = await get_grader_objects(assignment_id);
      let submission_json = await get_unassigned_submissions(assignment_id);
      let mapped = submission_json.map(v => v.id);

      //sum of num_assigned 
      let total_num_assigned = grader_array.reduce((total, element) => {
        return total + element.num_assigned;
      }, 0);

      //sum of max number of submissions that each grader can grade 
      let total_cap = grader_array.reduce((total, element) => {
        if (element.weight === 0) return total + (Math.min(element.cap, element.offset + element.num_assigned));
        return total + element.cap;
      }, 0);

      if (total_cap - total_num_assigned < mapped.length) {
        return reject("There are more submissions to be distributed than the graders can grade. Please increase the caps.")
      }
      else {
        let conflicts = await detect_conflicts(grader_array, assignment_id); //detects conflicts: if any grader's num_assigned exceeds their cap
        mapped = mapped.concat(conflicts.submissionsArray);
        assignmentsLeft = mapped.length > 0 ? true : false;

        if (assignmentsLeft) {
          let graders_assigned = distribution.main_distribute(mapped.length, conflicts.graderArray); //runs distribution algorithm 
          let matrix_of_pairs = distribution.formMatchingMatrix(graders_assigned, mapped); //assigns the appropriate number of submissions to each grader

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
 * Updates the assignments_cap SET in the DB, by updating each grader's 
 * total_assigned_for_assignment value for the assignment [assignment_id].
 * @param {Array} grader_array An array of AssignmentGrader objects representing the set of all graders 
 * @param {Number} assignment_id The assignment ID
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
 * Updates each grader's offset in the DB. 
 * @param {Array} grader_array An array of AssignmentGrader objects representing the set of all graders 
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
 * Precondition: All submission IDs must be unique - even across different 
 * assignments. 
 * Updates the submission SET in the DB, by setting the appropriate grader ID 
 * to the appropriate submission ID. 
 * @param {Array} assignment_matrix An array of pairs (grader ID, submission ID), 
 * representing which grader is assigned to which submission. 
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


module.exports = {
  runPipeline: runPipeline
}