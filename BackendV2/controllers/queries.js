/**
 * This file will store the logic behind all the database queries. All functions
 * defined here will deal with retrieving or pushing data from the 
 * MySQL database. 
 */
var mysql = require('mysql');
var AssignmentGrader = require('../distribution-algorithm/grader-model');
var DetectConflictOutput = require('./detect-conflicts-result');
var async = require('async')
var distribution = require('../distribution-algorithm/distribution.js');
const pool = require('../pool');
const axios = require('axios');

/**
 * Function that inserts a single assignment with relevant arguments into the database.
 * @param {string} id - ?
 * @param {string} name - ?
 * @param {string} due_date The date the assignment is due
 * @param {string} last_updated The date the assignment was last updated 
 */
// function insertSingleAssignment(id, name, due_date, last_updated, points_possible) {
//   let sql_query = "INSERT IGNORE INTO assignment (id, name, due_date, last_updated, points_possible) VALUES (?, ?, ?, ?, ?)";
//   pool.query(sql_query, [id, name, due_date, last_updated, points_possible], (err, result) => {
//     if (err) {
//       console.log(err);
//     }
//   });
// };


/**
 * A function that updates the grader for a submission
 * @param {int} grader_id - A unique id for a grader
 * @param {int} submission_id - An id for the submission
 */
function assignGraderToSubmission(grader_id, submission_id) {
  let query = "UPDATE submission SET grader_id = ? WHERE id = ?";
  let data = [grader_id, submission_id]

  pool.getConnection(function (err, connection) {
    if (err) throw err;
    connection.query(query, data);
    connection.release();
  });


};

//TESTED :D 
async function detect_conflicts(graderArray, assignment_id) {

  let extra_submissions = [];

  //checks to see which graders have num_assigned > cap --> need for re-distribution
  for (let i = 0; i < graderArray.length; i++) {

    surplus = graderArray[i].num_assigned - graderArray[i].cap;

    if (surplus > 0) {
      console.log("SURPLUS ALERT: " + surplus + "THE GRADER " + graderArray[i].grader_id + " HAS NUM ASSIGNED OF " + graderArray[i].num_assigned + " but cap of " + graderArray[i].cap)

      graderArray[i].update_dist_num_assigned(graderArray[i].cap);
      graderArray[i].update_num_assigned(graderArray[i].cap);
      graderArray[i].incrementOffset(surplus);
      let conflict_array = await handle_conflicts(graderArray[i].grader_id, surplus, assignment_id)
      extra_submissions = extra_submissions.concat(conflict_array);
    }
  }

  return new DetectConflictOutput(graderArray, extra_submissions);
}


//should be returning a 1D array of submisions IDs that are not graded by graderID for that specific assignment_id
function get_surplus_submissions(graderID, surplus, assignment_id) {
  return new Promise(function (resolve, reject) {
    let query = `SELECT * FROM submission WHERE grader_id =? AND assignment_id =? AND is_graded =? ORDER BY id`; // get submissions for this grader
    let surplusArr = []
    let data = [graderID, assignment_id, 0]

    pool.query(query, data, async function (error, results) {
      if (error) { reject(error) }

      if (results.length < surplus) reject(new Error("The number of ungraded assignments is less than the workload reduction."))
      for (let i = 0; i < surplus; i++) {
        console.log(results[i])
        surplusArr.push(results[i].id)
        await set_surplus_submissions(graderID, results[i].id, assignment_id)
      }
      resolve(surplusArr)
    });
  })
}

function set_surplus_submissions(graderID, submission_id, assignment_id) {

  let query = `UPDATE submission SET grader_id = NULL WHERE grader_id =? AND id =? AND assignment_id =?`
  let data = [graderID, submission_id, assignment_id]

  pool.getConnection(function (err, connection) {
    if (err) throw err;
    connection.query(query, data)
    connection.release();
    return true;
  });
}


/**
 * 
 * @param {*} graderID 
 * @param {*} surplus 
 * @param {*} assignment_id 
 */
async function handle_conflicts(graderID, surplus, assignment_id) {
  const submissionArr = await get_surplus_submissions(graderID, surplus, assignment_id)
  return submissionArr
}

function runPipeline(assignment_id) {
  return new Promise(async function (resolve, reject) {
    try {
      await pull_submissions_from_canvas(assignment_id)
      let grader_array = await get_grader_objects(assignment_id);
      console.log("first print: ")
      console.log(grader_array)
      let submission_json = await get_unassigned_submissions(assignment_id);
      let mapped = submission_json.map(v => v.id);

      let conflicts = await detect_conflicts(grader_array, assignment_id);
      mapped = mapped.concat(conflicts.submissionsArray);
      assignmentsLeft = mapped.length > 0 ? true : false;

      if (assignmentsLeft) {
        let graders_assigned = distribution.main_distribute(mapped.length, conflicts.graderArray);
        let matrix_of_pairs = distribution.formMatchingMatrix(graders_assigned, mapped);

        await update_grader_entries(graders_assigned) //update offsets of graders in DB with output_of_algo

        await assign_submissions_to_grader(matrix_of_pairs) //updates submissions and graders in DB with matrix_of_pairs

        await update_total_assigned(graders_assigned, assignment_id) //update num_assigned of graders in DB with output_of_algo

        resolve("Successfully distributed (or re-distributed) assignments.")
      } else {
        resolve("There are currently no assignments to distribute or re-distribute.")
      }
    } catch (error) {
      reject("Something went wrong with run pipeline")
    }
  })
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



/**
   * This function returns the list of all graders
   */
function get_grader_table(_, res, _) {
  let query = "SELECT * FROM grader";

  pool.getConnection(function (err, connection) {
    if (err) throw err;
    connection.query(query, (err, results) => {
      if (err) {
        throw err
      } else {
        res.json(results);
      }
    })
    connection.release();
  });
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

function update_multiple_graders_data_route(req, res) {
  const callback = (err) => {
    if (err) {
      res.status(406).send({
        status: "fail",
        message: "Something went wrong"
      });
      console.log(err)
    } else {
      res.send("success");
    }
  }
  update_multiple_graders_data(req.body, callback);
}

/**
 * @param {*} graders_arr: [{"id": 123, "weight": 5, "offset": -1}, {"id": 234, "offset": 0}, {"id: 345", "weight": 3}]
 * @param {*} callback
 */
function update_multiple_graders_data(graders_arr, callback) {
  let queries = "";
  graders_arr.forEach(grader => {
    let { id, ...data } = grader;
    console.log(grader)
    console.log(id)
    queries += mysql.format("UPDATE grader SET ? WHERE id = ?;", [data, id]);
  });
  pool.query(queries, callback);
}

/**
 * @param {*} grader_id
 * @param {*} grader_obj: the columns and their values to be updated. e.g. {"weight": 5, "offset": -1}
 * @param {*} callback 
 */
function update_single_grader_data(grader_id, grader_obj, callback) {
  let sql_query = "UPDATE grader SET ? WHERE id = ?";
  pool.query(sql_query, [grader_obj, grader_id], callback)
}


/**
 * Given a grader, this method updates the graders cap. Throws error otherwise. 
 * @param {object} req 
 * @param {object} res 
 */
function update_caps(req, res) {
  let sql_query = "UPDATE assignments_cap SET cap = ?  WHERE grader_id = ? AND assignment_id = ?";
  pool.query(
    sql_query, [req.body.cap, req.body.grader_id, req.body.assignment_id],
    function (err, results) {
      if (err) {
        console.log(err);
      } else {
        res.send()
      }
    }
  )
}


/**
   * This function takes in a grader_id and updates the weight for that grader
   * @param {*} grader_id
   * @param {*} weight 
   */
function update_grader_weight(req, res) {
  let sql_query = "UPDATE grader SET weight = ? WHERE id = ?";
  pool.query(sql_query, [req.body.weight, req.body.grader_id], (err) => {
    if (err) {
      res.status(406).send({
        status: "fail",
        message: "Something went wrong"
      });
    } else {
      res.send("success");
    }
  }
  );
}




//START OF UPDATING ASSIGNMENTS CAP FUNCTIONALITY 

async function insert_into_assignments_cap(assignment_id, grader_id) {
  return new Promise((resolve, reject) => {
    let query = `INSERT INTO assignments_cap SET total_assigned_for_assignment=0, cap=100, grader_id=${grader_id}, assignment_id=${assignment_id}`;
    pool.getConnection(function (err, connection) {
      if (err) return reject(err)
      connection.query(query, (err) => {
        connection.release();
        if (err) {
          return reject(err)
        } else {
          return resolve()
        }
      })
    });
  })
}


async function get_graders() {
  return new Promise((resolve, reject) => {
    let query = "SELECT * FROM grader";
    pool.getConnection(function (err, connection) {
      if (err) return reject(err);
      connection.query(query, (err, results) => {
        connection.release();
        if (err) {
          return reject(err)
        } else {
          return resolve(results)
        }
      })
    });
  })
}


async function get_existing_assignments(grader_id) {
  return new Promise((resolve, reject) => {
    let query = `SELECT * FROM assignments_cap WHERE grader_id = ${grader_id}`;
    pool.getConnection(function (err, connection) {
      if (err) return reject(err);
      connection.query(query, (err, results) => {
        connection.release();
        if (err) {
          return reject(err)
        } else {
          results = results.map(result => result.assignment_id)
          return resolve(results)
        }
      })
    });
  })
}




async function update_assignments_cap_table(req, res) {
  try {
    await runUpdate(req.body.assignment_id) //UPDATE --> SHOULD PASS IN AN ARRAY OF ASSIGNMENT IDs
    res.send()
  } catch (error) {
    console.log("error")
    console.log(error)
    res.status(404)
  }
}




async function runUpdate(/*assignment_ids*/) {

  let assignment_ids = [1, 2, 3, 4, 56, 7634, 81, 2002, 100, 92, 109377, 109378, 25611, 2562, 82, 82, 97653];

  return new Promise(async function (resolve, reject) {
    try {
      let graders = await get_graders();
      graders = graders.map(grader => grader.id);

      console.log("check 1")
      console.log(graders)

      let existing_assignmentIDs = []

      if (graders.length !== 0)
        existing_assignmentIDs = await get_existing_assignments(graders[0]);

      console.log("check 2")
      console.log(existing_assignmentIDs)

      assignment_ids = assignment_ids.filter(assignment => !existing_assignmentIDs.includes(assignment))

      console.log("check 3")
      console.log(assignment_ids)

      assignment_ids.forEach(assignment_id => {
        graders.forEach(async grader_id => {
          console.log("assignmen id: " + assignment_id + "  grader: " + grader_id)
          await insert_into_assignments_cap(assignment_id, grader_id)
        })
      });

      console.log("ENDDD")
      resolve("Successfully updated the assignments_cap table.")

    } catch (error) {
      reject("Something went wrong with updating the assignments_cap table")
    }
  })
}

//END OF UPDATING ASSIGNMENT CAPS FUNCTIONALITY



/**
 * @param {*} assignment_id
 * Returns the assigned submissions for every grader for an assignment:
 * {grader1_id: [submission1_id, submission2_id], grader2_id: [submission3_id, submission4_id]}
 */
function get_assigned_submissions_for_graders(req, res) {
  let sql_query = "SELECT grader_id, id AS submission_id FROM submission WHERE assignment_id=? AND grader_id IS NOT NULL order by grader_id";
  pool.query(
    sql_query, [req.query.assignment_id],
    function (err, results) {
      if (err) {
        console.log(err);
      } else {
        data = results.reduce((assigned_submissions, row) => {
          assigned_submissions[row.grader_id] ?
            assigned_submissions[row.grader_id].push(row.submission_id)
            : assigned_submissions[row.grader_id] = [row.submission_id];
          return assigned_submissions;
        }, {})
        res.json(data);
      }
    }
  )
}

/**
  * This function takes in grader_id and assigment_id and returns the list of submissions that are assigned for that grader
  * @param {*} user_id 
  * @param {*} assigment_id 
  */
function get_assigned_submission_for_assigment(req, res) {
  let sql_query = "SELECT * FROM submission WHERE assignment_id=? AND grader_id=?";
  pool.query(
    sql_query, [req.query.assigment_id, req.query.user_id],
    function (err, results) {
      if (err) {
        console.log("err");
      } else {
        res.json(results);
      }
    }
  );
}


/**
* This function gets the grading progress for each grader given assignment_id
* @param {*} assigment_id
* @param {*} grader_id
*/
function get_grading_progress_for_every_grader(req, res) {
  let sql_query = "SELECT submission.id, grader_id, assignment_id, is_graded, offset, weight, total_graded FROM submission JOIN grader ON submission.grader_id = grader.id WHERE assignment_id=? AND grader_id IS NOT NULL";
  pool.query(sql_query, [req.query.assigment_id], (err, results) => {
    if (err) {
      res.status(406).send({
        status: "fail",
        message: "Something went wrong"
      });
    } else {
      let graders = {};
      let progress = [];
      results.forEach((submission) => {
        if (!(submission.grader_id in graders)) {
          graders[submission.grader_id] = [submission.weight, submission.offset];
        }
      });
      Object.keys(graders).forEach((grader) => {
        let grader_total = 0;
        let grader_completed = 0;
        results.forEach((submission) => {
          if (submission.grader_id == grader) {
            grader_total += 1;
            if (submission.is_graded == 1) {
              grader_completed += 1;
            }
          }
        })
        progress.push({ "grader": grader[0], "global": { "weight": graders[grader][0], "offset": graders[grader][1] }, "progress": { "total": grader_total, "completed": grader_completed } })
      })
      res.json(progress);
    }
  });
}

//TOOD: Refactor the 3 functions into one function. 

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

async function insertAllSubmission(json_string) {
  pool.getConnection(function (err, connection) {
    if (err) throw err;
    json_string.forEach(e => {
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
  })
}


function pull_submissions_from_canvas(assignment_id) {
  return new Promise(async function (resolve, reject) {
    const config = {
      //TODO: Factor out bearer tokens into another file that isn't publicly accessible.
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
    pool.getConnection(function (err, connection) {
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














function insertAllGraders(json_string) {
  pool.getConnection(function (error, connection) {
    json_string.forEach(e => {
      let id = e.id;
      let grader_name = e.user.name;
      let offset = 0;

      let role;
      if (e.type == 'TaEnrollment') {
        role = "TA";
      } else if (e.type == "ObserverEnrollment") {
        role = "Grader";
      } else {
        role = "Consultant";
      }

      let total_graded = 0;
      let weight = -1;
      let last_updated = e.updated_at.replace("T", " ").replace("Z", "");

      let query = "INSERT IGNORE INTO grader (id, name, offset, role, total_graded, weight, last_updated) VALUES (?, ?, ?, ?, ?, ?, ?)";
      let data = [id, grader_name, offset, role, total_graded, weight, last_updated]
      connection.query(query, data);
    });
    connection.release();
  })
}

function insert_assignment_cap(id, assigment_id, student_id, cap) {
  let sql_query = "INSERT INTO assignments_cap (id, assignment_id, student_id, cap) VALUES (? ? ? ?)"
  pool.query(sql_query, [id, assignment_id, student_id, cap], (err, _) => {
    if (err) console.log(err);
  })
}

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



async function run_distribution_pipeline(req, res) {
  try {
    await runPipeline(req.body.assignment_id)
    res.send()
  } catch (error) {
    console.log("error")
    console.log(error)
    res.status(404)
  }
}



module.exports = {

  insert_assignment_cap: insert_assignment_cap,

  get_assignment_cap: get_assignment_cap,

  insertAllGraders: insertAllGraders,

  insertAllSubmission: insertAllSubmission,

  get_unassigned_submissions: get_unassigned_submissions,

  get_grader_objects: get_grader_objects,

  get_grader_table: get_grader_table,

  update_grader_weight: update_grader_weight,

  get_assigned_submissions_for_graders: get_assigned_submissions_for_graders,

  get_surplus_submissions: get_surplus_submissions,

  set_surplus_submissions: set_surplus_submissions,

  get_assigned_submission_for_assigment: get_assigned_submission_for_assigment,

  get_grading_progress_for_every_grader: get_grading_progress_for_every_grader,

  update_grader_entries: update_grader_entries,

  update_total_assigned: update_total_assigned,

  update_single_grader_data: update_single_grader_data,

  update_multiple_graders_data: update_multiple_graders_data,

  update_multiple_graders_data_route: update_multiple_graders_data_route,

  assign_submissions_to_grader: assign_submissions_to_grader,

  run_distribution_pipeline: run_distribution_pipeline,

  update_caps: update_caps,

  handle_conflicts: handle_conflicts,

  update_assignments_cap_table: update_assignments_cap_table,

  runPipeline: runPipeline,

  get_existing_assignments: get_existing_assignments,

  runUpdate: runUpdate

}