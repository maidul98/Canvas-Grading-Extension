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
// const pool = require('../connection');
const axios = require('axios');

/** Configure Heroku Connection */
/** TODO: Store all these constants in a separate file, gitignore it and figure 
 * out deployment mechanism - where will these pins be stored? That is a later 
 * problem */

var db = mysql.createPool({
  host: "us-cdbr-iron-east-04.cleardb.net",
  user: "be9696052936bb",
  password: "4f1c4dfa",
  database: "heroku_aff64052225438d",
});

// var db = mysql.createPool({
//   host: "localhost",
//   user: "root",
//   password: "",
//   database: "cs5150",
// });


// setInterval(function () {
//   db.query('SELECT 1');
// }, 15000);

/**
 * Function that inserts a single assignment with relevant arguments into the database.
 * @param {string} id - ?
 * @param {string} name - ?
 * @param {string} due_date The date the assignment is due
 * @param {string} last_updated The date the assignment was last updated 
 */
// function insertSingleAssignment(id, name, due_date, last_updated, points_possible) {
//   let sql_query = "INSERT IGNORE INTO assignment (id, name, due_date, last_updated, points_possible) VALUES (?, ?, ?, ?, ?)";
//   db.query(sql_query, [id, name, due_date, last_updated, points_possible], (err, result) => {
//     if (err) {
//       console.log(err);
//     }
//   });
// };

/**
 * Function that inserts a single grader with relevant arguments into the database.
 * @param {int} id - Unique ID for the grader
 * @param {string} name - Grader name
 * @param {int} offset - Offset of submissions for the grader
 * @param {string} role - The type of grader (TA, consultant, grader)
 * @param {int} total_graded - Total number of submissions graded
 * @param {int} weight - Submission weight assigned to grader
 * @param {string} last_updated - When the grader was last updated
 */
function insertSingleGrader(id, name, offset, role, total_graded, weight, last_updated) {
  let query = "INSERT IGNORE INTO grader (id, name, offset, role, total_graded, weight, last_updated) VALUES (?, ?, ?, ?, ?, ?, ?)";
  let data = [id, name, offset, role, total_graded, weight, last_updated]

  db.getConnection(function (err, connection) {
    if (err) throw err;
    connection.query(query, data);
    connection.release();
  });
};



//TODO: Modify query so that it updates if new query with same id comes in
function insertSingleSubmission(id, grader_id, assignment_id, is_graded, last_updated, name, user_id) {
  let query = "INSERT IGNORE INTO submission (id, grader_id, assignment_id, is_graded, last_updated, name, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)";
  let data = [id, grader_id, assignment_id, is_graded, last_updated, name, user_id]

  db.getConnection(function (err, connection) {
    if (err) throw err;
    connection.query(query, data);
    connection.release();
  });

};


/**
 * A function that updates the grader for a submission
 * @param {int} grader_id - A unique id for a grader
 * @param {int} submission_id - An id for the submission
 */
function assignGraderToSubmission(grader_id, submission_id) {
  let query = "UPDATE submission SET grader_id = ? WHERE id = ?";
  let data = [grader_id, submission_id]

  db.getConnection(function (err, connection) {
    if (err) throw err;
    connection.query(query, data);
    connection.release();
  });


};


//TESTED :D 
function detect_conflicts(graderArray) {

  let extra_submissions = [];

  //checks to see which graders have num_assigned > cap --> need for re-distribution
  for (let i = 0; i < graderArray.length; i++) {

    surplus = graderArray[i].num_assigned - graderArray[i].cap;

    if (surplus > 0) {
      graderArray[i].update_dist_num_assigned(graderArray[i].cap);
      graderArray[i].update_num_assigned(graderArray[i].cap);
      graderArray[i].incrementOffset(surplus);
      extra_submissions = extra_submissions.concat(handle_conflicts(graderArray[i].grader_id, surplus));
    }
  }

  return new DetectConflictOutput(graderArray, extra_submissions);
}



async function get_surplus_submissions(graderID, surplus) {
  let query = `SELECT * FROM submission WHERE grader_id =?  ORDER BY grader_id`; // get submissions for this grader
  let surplusArr = []
  let data = [graderID]

  db.getConnection(function (err, connection) {
    if (err) throw err;
    connection.query(query, data, function (error, results) {
      if (error) return console.log(err)
      count = 0
      for (let i = 0; i < surplus; i++) { //loop to get [surplus] entries. Assuming that there are >= surplus entries in results.
        surplusArr.push(results[i].grader_id)
      }
    });
    connection.release();
  });

  return surplusArr
  
}

function set_surplus_submissions(graderID, surplus) {

  let query = `UPDATE submission SET grader_id = NULL WHERE grader_id =? ORDER BY grader_id LIMIT ?`
  let data = [graderID, surplus]

  db.getConnection(function (err, connection) {
    if (err) throw err;
    connection.query(query, data)
    connection.release();
  });
}


// Remember even async/await return Promises

//functionality to remove [surplus] randomly-selected ungraded 
//submissions from this grader's workload; should return the submission 
//id's of the [surplus] assignments which have been removed and now 
//have a null grader 
async function handle_conflicts(graderID, surplus) {
  const submissionArr = await get_surplus_submissions(graderID, surplus)
  await set_surplus_submissions(graderID, surplus)
  return submissionArr
}

async function runPipeline(req, res) {

  let assignmentsLeft;
  //axios.put(`/pull-submissions-and-update/${req.query.assignment_id}`,
  // (req, res) => console.log("pulling submissions")).catch(err => console.log(err));
  get_grader_objects(req.body.assignment_id)
    .then(async grader_array => {
      await get_unassigned_submissions(req.body.assignment_id)
        .then(submission_json => {
          return submission_json.map(v => v.id);
        })
        .then(mapped => {
          let conflicts = detect_conflicts(grader_array);
          mapped = mapped.concat(conflicts.submissionsArray);
          assignmentsLeft = mapped.length > 0 ? true : false;
          if (assignmentsLeft) {
            let graders_assigned = distribution.main_distribute(mapped.length, conflicts.graderArray);
            let matrix_of_pairs = distribution.formMatchingMatrix(graders_assigned, mapped);
            //update offsets of graders in DB with output_of_algo
            update_grader_entries(graders_assigned, function (err) {
              if (err) throw err;
            });
            assign_submissions_to_grader(matrix_of_pairs, function (err) {
              if (err) throw err;
            });
            //update num_assigned of graders in DB with output_of_algo
            update_total_assigned(graders_assigned, req.body.assignment_id, function (err) {
              if (err) console.log(err);
            });
          }
        })
        .catch(err => console.log(err));
    })
    .then(() => {
      console.log("vallll" + assignmentsLeft);
      assignmentsLeft ? res.send("Successfully distributed (or re-distributed) assignments.") : res.send("There are currently no assignments to distribute or re-distribute.")
    })
    .catch(err => console.log(err));
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
    get_assignment_cap(assignment_id)
      .then(response => {
        response.sort(function (a, b) {
          if (a.grader_id === b.grader_id) return 0
          return b.grader_id > a.grader_id ? 1 : -1
        })
        let query = "SELECT * FROM grader"

        db.getConnection(function (err, connection) {
          if (err) throw err;
          connection.query(query, (err, results) => {
            if (err) {
              reject(err)
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
              if (grader_array.length != response.length) throw Error('you done messed up')
              for (let i = 0; i < grader_array.length; i++) {
                let assigned = response[i].total_assigned_for_assignment;
                grader_array[i].update_num_assigned(assigned);
                grader_array[i].update_dist_num_assigned(assigned);
                grader_array[i].update_cap(response[i].cap);
              }
              connection.release();
              resolve(grader_array)
            }
          })
        });
      })

  })
}



/**
   * This function returns the list of all graders
   */
function get_grader_table(_, res, _) {
  let query = "SELECT * FROM grader";

  db.getConnection(function (err, connection) {
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

    db.getConnection(function (err, connection) {
      if (err) throw err;
      connection.query(query, (err, results) => {
        if (err) {
          reject(err)
        } else {
          connection.release();
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
    queries += mysql.format("UPDATE grader SET ? WHERE id = ?; ", [data, id]);
  });
  db.query(queries, callback);
}

/**
 * @param {*} grader_id
 * @param {*} grader_obj: the columns and their values to be updated. e.g. {"weight": 5, "offset": -1}
 * @param {*} callback 
 */
function update_single_grader_data(grader_id, grader_obj, callback) {
  let sql_query = "UPDATE grader SET ? WHERE id = ?";
  db.query(sql_query, [grader_obj, grader_id], callback)
}


/**
 * Given a grader, this method updates the graders cap. Throws error otherwise. 
 * @param {object} req 
 * @param {object} res 
 */
function update_caps(req, res) {
  let sql_query = "UPDATE assignments_cap SET cap = ?  WHERE grader_id = ? AND assignment_id = ?";
  db.query(
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
  db.query(sql_query, [req.body.weight, req.body.grader_id], (err) => {
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

/**
 * @param {*} assignment_id
 * Returns the assigned submissions for every grader for an assignment:
 * {grader1_id: [submission1_id, submission2_id], grader2_id: [submission3_id, submission4_id]}
 */
function get_assigned_submissions_for_graders(req, res) {
  let sql_query = "SELECT grader_id, id AS submission_id FROM submission WHERE assignment_id=? AND grader_id IS NOT NULL order by grader_id";
  db.query(
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
  db.query(
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
*/
function get_grading_progress_for_every_grader(req, res) {
  let sql_query = "SELECT submission.id, grader_id, assignment_id, is_graded, offset, weight, total_graded FROM submission JOIN grader ON submission.grader_id = grader.id WHERE assignment_id=? AND grader_id IS NOT NULL";
  db.query(sql_query, [req.query.assigment_id], (err, results) => {
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


/**
 * Get weights, net_id, and offset for all graders
 * @param {*} req 
 * @param {*} res 
 */
function get_grader_info(req, res) {
  let sql_query = "SELECT * FROM grader";
  db.query(sql_query, [req.query.assigment_id], (err, results) => {

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
  db.query(sql_query, [req.query.assigment_id], (err, results) => {
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

function update_total_assigned(grader_array, assignment_id, callback) {
  async.forEachOf(grader_array, function (grader, _, inner_callback) {
    let query = "UPDATE assignments_cap SET total_assigned_for_assignment=? WHERE grader_id=? AND assignment_id=?"
    let data = [grader.num_assigned, grader.grader_id, assignment_id]
    db.getConnection(function (err, connection) {
      if (err) throw err;
      connection.query(query, data, (err, results) => {
        if (err) {
          inner_callback(err)
          callback(err)
        } else {
          inner_callback(null)
        }
      })
      connection.release();
    });
  })
}


function update_grader_entries(grader_array, callback) {
  async.forEachOf(grader_array, function (grader, _, inner_callback) {
    console.log("update_grader_entries");
    let query = "UPDATE grader SET offset=? WHERE id=?"
    let data = [grader.offset, grader.grader_id]

    db.getConnection(function (err, connection) {
      if (err) throw err;
      connection.query(query, data, (err, results) => {
        if (err) {
          console.log(err)
          inner_callback(err)
          callback(err)
        } else {
          inner_callback(null)
        }
      })
      connection.release();
    });
  }, function (err) {
    if (err) {
      console.log(err);
      callback(err)
    } else {
      callback(null)
    }
  });
}

function assign_submissions_to_grader(assignment_matrix, callback) {
  async.forEachOf(assignment_matrix, function (pairing, _, inner_callback) {
    let query = "UPDATE submission SET grader_id = ? WHERE id = ?"
    let data = [pairing[0], pairing[1]]
    db.getConnection(function (err, connection) {
      if (err) throw err;
      connection.query(query, data, (err, results) => {
        console.log(pairing[0] + "  " + pairing[1]);
        if (err) {
          console.log(err)
          inner_callback(err)
          callback(err)
        } else {
          inner_callback(null)
        }
      })
      connection.release();
    });
  }, function (err) {
    if (err) {
      console.log(err)
      callback(err)
    } else {
      callback(null)
    }
  })
}

async function insertAllSubmission(json_string) {
  console.log(json_string)
  json_string.forEach(e => {
    let id = e.id;
    let grader_id = e.grader_id;
    let assignment_id = e.assignment_id;
    let is_graded = e.is_graded;
    let last_updated = e.updated_at.replace("T", " ").replace("Z", "");
    let name = e.name;
    let user_id = e.user_id

    insertSingleSubmission(id, grader_id, assignment_id, is_graded, last_updated, name, user_id);
  });
}



function insertConflict(id, grader_id, reason, approved, reassigned_grader_id, submission_id) {
  let sql_query = "INSERT IGNORE INTO conflict (id, grader_id, reason, approved, reassigned_grader_id, submission_id) VALUES (?, ?, ?, ?, ?, ?)";
  db.query(sql_query, [id, grader_id, reason, approved, reassigned_grader_id, submission_id], (err, _) => {
    if (err) {
      console.log(err);
    }
  })
}



function insertAllGraders(json_string) {
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

    insertSingleGrader(id, grader_name, offset, role, total_graded, weight, last_updated);
  })
}

function insert_assignment_cap(id, assigment_id, student_id, cap) {
  let sql_query = "INSERT INTO assignments_cap (id, assignment_id, student_id, cap) VALUES (? ? ? ?)"
  db.query(sql_query, [id, assignment_id, student_id, cap], (err, _) => {
    if (err) console.log(err);
  })
}

function get_assignment_cap(assignment_id) {
  return new Promise((resolve, reject) => {
    let query = `SELECT * from assignments_cap WHERE assignment_id=${assignment_id}`;

    db.getConnection(function (err, connection) {
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
    await runPipeline(req, res)
    // res.send()
  } catch (error) {
    res.status(404)
  }
}



module.exports = {

  insert_assignment_cap: insert_assignment_cap,

  get_assignment_cap: get_assignment_cap,

  insertAllGraders: insertAllGraders,

  insertConflict: insertConflict,

  insertAllSubmission: insertAllSubmission,

  get_grader_info: get_grader_info,

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

  get_grader_info: get_grader_info,

  update_caps: update_caps,
}