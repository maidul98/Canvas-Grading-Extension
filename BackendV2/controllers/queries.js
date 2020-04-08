/**
 * This file will store the logic behind all the database queries. All functions
 * defined here will deal with retrieving or pushing data from the 
 * MySQL database. 
 */
var mysql = require('mysql');
var AssignmentGrader = require('../distribution-algorithm/grader-model');
var async = require('async')
var distribution = require('../distribution-algorithm/distribution.js');

/** Configure Heroku Connection */
/** TODO: Store all these constants in a separate file, gitignore it and figure 
 * out deployment mechanism - where will these pins be stored? That is a later 
 * problem */
var db = mysql.createPool({
  host: "us-cdbr-iron-east-04.cleardb.net",
  user: "be9696052936bb",
  password: "4f1c4dfa",
  database: "heroku_aff64052225438d",
  multipleStatements: true,
  port: 3306,
  connectTimeout: 100000,
  max_questions: 5000
});

setInterval(function () {
  db.query('SELECT 1');
}, 15000);

/**
 * A higher-order function that returns a function for querying a full table.
 * @param {string} tableName The name of the table to be queried. Make sure the 
 * table exists to avoid TableNotFoundErrors on Heroku/
 */
function createQueryFunction(tableName) {
  return function (_, res, _) {
    var a1 = "SELECT * FROM " + tableName;
    db.query(a1, (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.json(result);
      }
    });
  };
}

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
  let sql_query = "INSERT IGNORE INTO grader (id, name, offset, role, total_graded, weight, last_updated) VALUES (?, ?, ?, ?, ?, ?, ?)";
  db.query(sql_query, [id, name, offset, role, total_graded, weight, last_updated], (err, result) => {
    if (err) {
      console.log(err);
    }
  })
};



//TODO: Modify query so that it updates if new query with same id comes in
function insertSingleSubmission(id, grader_id, assignment_id, is_graded, last_updated, name, user_id) {
  let sql_query = "INSERT IGNORE INTO submission (id, grader_id, assignment_id, is_graded, last_updated, name, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)";
  db.query(sql_query, [id, grader_id, assignment_id, is_graded, last_updated, name, user_id], (err, result) => {
    if (err) {
      console.log(err);
    }
  });
};



//TODO: DELETE when pipeline has been tested
function formMatchingMatrix(grader_array, submissions_array) {
  //need to require('./grader-model'); ???
  const len = submissions_array.length;

  if (len === 0) {
    console.log("There are currently no assignments to distribute.");
    return [];
  }

  var matrix = new Array(len).fill(0).map(() => new Array(2).fill(0));
  shuffle(submissions_array);

  var counter = 0;
  for (var j = 0; j < grader_array.length; j++) {
    num_assigned = grader_array[j].num_assigned;
    id = grader_array[j].grader_id;
    for (var i = counter; i < counter + num_assigned; i++) {
      matrix[i][0] = id;
    }
    counter += num_assigned;
  }

  for (var i = 0; i < len; i++)
    matrix[i][1] = submissions_array[i];

  return matrix;
}



/**
 * A function that updates the grader for a submission
 * @param {int} grader_id - A unique id for a grader
 * @param {int} submission_id - An id for the submission
 */
function assignGraderToSubmission(grader_id, submission_id) {
  let sql_query = "UPDATE submission SET grader_id = ? WHERE id = ?";
  db.query(sql_query, [grader_id, submission_id], (err, result) => {
    if (err) {
      console.log(err);
    }
  })
};



async function runPipeline(res) {
  let assignmentsLeft;
  get_grader_objects()
    .then(grader_array => {
      get_unassigned_submissions()
        .then(submission_json => {
          return submission_json.map(v => v.id);
        })
        .then(mapped => {
          if (mapped.length === 0) {
            assignmentsLeft = false;
          }
          else {
            assignmentsLeft = true;
            let output_of_algo = distribution.distribute(mapped.length, grader_array);
            let matrix_of_pairs = distribution.formMatchingMatrix(output_of_algo, mapped);
            //update offsets of graders in DB with output_of_algo
            update_grader_entries(output_of_algo, function (err) {
              if (err) console.log(err);
            });
            //update submissions DB with matrix_of_pairs 
            assign_submissions_to_grader(matrix_of_pairs, function (err) {
              if (err) console.log(err);
            });
          }
        })
        .catch(err => console.log(err));
    })
    .then(assignmentsLeft ? res.send("Successfully distributed assignments.") : res.send("There are no assignments left to distribute."))
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
function get_grader_objects() {
  return new Promise(function (resolve, reject) {

    let sql_query = "SELECT * FROM grader"
    db.query(sql_query, (err, results) => {
      if (err) {
        console.log(err)
        return reject(err)
      } else {
        grader_array = []
        results.forEach(grader => {
          let id = grader.id
          let offset = grader.offset
          let weight = grader.weight
          let graderObj = new AssignmentGrader(id, weight, offset, 0)
          grader_array.push(graderObj)
        })
        resolve(grader_array)
      }
    })

  })
}



/**
   * This function returns the list of all graders
   */
function get_grader_table(_, res, _) {
  let sql_query = "SELECT * FROM grader";
  db.query(sql_query, (err, results) => {
    if (err) {
      console.log(err);
    } else {
      res.json(results);
    }
  });
}



/**
 * This function returns the list of unassigned submissions
 */
function get_unassigned_submissions() {
  return new Promise((resolve, reject) => {
    let sql_query = "SELECT * FROM submission WHERE grader_id IS NULL";
    db.query(sql_query, (err, results) => {
      if (err) {
        console.log(err);
        reject(err)
      } else {
        //res.json(results);
        return resolve(results)
      }
    });
  })

}

function update_multiple_graders_data_route(req, res) {
  console.log("hi");
  const callback = (err) => {
    if(err){
      res.status(406).send({
        status: "fail",
        message: "Something went wrong"
      });
    } else {
      res.send("success");
    }
  }
  console.log(req.body);
  update_multiple_graders_data(req.body, callback);
}

/**
 * @param {*} graders_arr: [{"id": 123, "weight": 5, "offset": -1}, {"id": 234, "offset": 0}, {"id: 345", "weight": 3}]
 * @param {*} callback
 */
function update_multiple_graders_data(graders_arr, callback) {
  let queries = "";
  graders_arr.forEach(grader=>{
    let {id, ...data} = grader;
    queries += mysql.format("UPDATE grader SET ? WHERE id = ?; ", [data, id]);
  });
  console.log(queries);
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
function get_assigned_submissions_for_graders(req, res){
  let sql_query = "SELECT grader_id, id AS submission_id FROM submission WHERE assignment_id=? order by grader_id";
  db.query(
    sql_query, [req.query.assignment_id],
    function (err, results){
      if(err){
        console.log(err);
      } else {
        data = results.reduce((assigned_submissions, row)=>{
          assigned_submissions[row.grader_id]?
          assigned_submissions[row.grader_id].push(row.submission_id)
          :assigned_submissions[row.grader_id]=[row.submission_id];
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



//TOOD: Refactor the 2 functions into one function. 
function update_grader_entries(grader_array, callback) {
  async.forEachOf(grader_array, function (grader, _, inner_callback) {
    let sql_query = "UPDATE grader SET offset=? WHERE id=?"
    db.query(sql_query, [grader.offset, grader.grader_id], (err, results) => {
      if (err) {
        console.log(err)
        inner_callback(err)
        callback(err)
      } else {
        inner_callback(null)
      }
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
    let sql_query = "UPDATE submission SET grader_id = ? WHERE id = ?"
    db.query(sql_query, [pairing[0], pairing[1]], (err, results) => {
      if (err) {
        console.log(err)
        inner_callback(err)
        callback(err)
      } else {
        inner_callback(null)
      }
    })
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



async function run_distribution_pipeline(req, res) {
  await runPipeline(res)
}



module.exports = {

  insertAllGraders: insertAllGraders,

  insertConflict: insertConflict,

  insertAllSubmission: insertAllSubmission,

  get_grader_info: get_grader_info,

  get_unassigned_submissions: get_unassigned_submissions,

  get_grader_objects: get_grader_objects,

  get_grader_table: get_grader_table,

  update_grader_weight: update_grader_weight,

  get_assigned_submissions_for_graders: get_assigned_submissions_for_graders,

  get_assigned_submission_for_assigment: get_assigned_submission_for_assigment,

  get_grading_progress_for_every_grader: get_grading_progress_for_every_grader,

  update_grader_entries: update_grader_entries,

  update_single_grader_data: update_single_grader_data,

  update_multiple_graders_data: update_multiple_graders_data,

  update_multiple_graders_data_route: update_multiple_graders_data_route,

  assign_submissions_to_grader: assign_submissions_to_grader,

  run_distribution_pipeline: run_distribution_pipeline,

  get_grader_info: get_grader_info
}