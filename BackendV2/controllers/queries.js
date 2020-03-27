/**
 * This file will store the logic behind all the database queries. All functions
 * defined here will deal with retrieving or pushing data from the 
 * MySQL database. 
 */
var mysql = require('mysql');
var AssignmentGrader = require('../distribution-algorithm/grader-model');
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
    var a1 = "SELECT * FROM `" + tableName + "`";
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

function insertSingleSubmission(id, grader_id, assignment_id, is_graded, last_updated, grade) {
  let sql_query = "INSERT IGNORE INTO submission (id, grader_id, assignment_id, is_graded, last_updated, grade) VALUES (?, ?, ?, ?)";
  db.query(sql_query, [id, grader_id, assignment_id, is_graded, last_updated, grade], (err, result) => {
    if (err) {
      console.log(err);
    }
  });
};


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

module.exports = {

  // insertPublishedassignment: function (json_string) {
  //   let assignment = json_string;
  //   assignment.forEach(e => {
  //     let id = e.id;
  //     let name = e.name;
  //     let due_date = e.due_at;
  //     let last_updated = e.updated_at.replace("T", " ").replace("Z", "");
  //     let points_possible = e.points_possible
  //     insertSingleAssignment(id, name, due_date, last_updated, points_possible);
  //   });
  // },

  insertAllSubmission: function (json_string) {
    json_string.forEach(e => {
      let id = e.id;
      let grader_id = e.grader_id;
      let assignment_id = e.assignment_id;
      let is_graded = e.is_graded;
      let last_updated = e.updated_at.replace("T", " ").replace("Z", "");
      let grade = e.grade;

      insertSingleSubmission(id, grader_id, assignment_id, is_graded, last_updated, grade);
    });
  },

  insertConflict: function (id, grader_id, reason, approved, reassigned_grader_id, submission_id) {
    let sql_query = "INSERT IGNORE INTO conflict (id, grader_id, reason, approved, reassigned_grader_id, submission_id) VALUES (?, ?, ?, ?, ?, ?)";
    db.query(sql_query, [id, grader_id, reason, approved, reassigned_grader_id, submission_id], (err, _) => {
      if (err) {
        console.log(err);
      }
    })
  },

  insertAllGraders: function (json_string) {
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
  },

  /**
  * This function takes in grader_id and assigment_id and returns the list of submissions that are assigned for that grader
  * @param {*} user_id 
  * @param {*} assigment_id 
  */
  get_assigned_submission_for_assigment: function (req, res) {
    let sql_query = "SELECT * FROM submission WHERE assignment_id=? AND grader_id=?";
    db.query(
      sql_query, [req.query.assigment_id, req.query.user_id],
      function (err, results) {
        if (err) {
          console.log(err);
        } else {
          res.json(results);
        }
      }
    );
  },

  /**
   * This function returns the list of unassigned submissions
   */
  get_unassigned_submissions: function (_, res, _) {
    let sql_query = "SELECT * FROM submission WHERE grader_id IS NULL";
    db.query(sql_query, (err, results) => {
      if (err) {
        console.log(err);
      } else {
        res.json(results);
      }
    });
  },

  /**
   * This function returns the list of all graders
   */
  get_grader_table: function (_, res, _) {
    let sql_query = "SELECT * FROM grader";
    db.query(sql_query, (err, results) => {
      if (err) {
        console.log(err);
      } else {
        res.json(results);
      }
    });
  },

  /**
   * This function takes in a grader_id and updates the weight for that grader
   * @param {*} grader_id
   * @param {*} weight 
   */
  update_grader_weight: function (req, res) {
    let sql_query = "UPDATE grader SET weight=? WHERE id=?";
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
  },

  /**
   * This function gets the overall progress for a given assignment_id
   * @param {*} assigment_id
   */
  get_grading_progress_for_assignment: function (req, res) {
    let sql_query = "SELECT * FROM submission WHERE assignment_id=?";
    db.query(sql_query, [req.query.assigment_id], (err, results) => {
      if (err) {
        res.status(406).send({
          status: "fail",
          message: "Something went wrong"
        });
      } else {
        let total = results.length;
        let completed = 0;
        results.forEach((submission) => {
          if (submission.is_graded == 1) {
            completed += 1
          };
        });
        res.json({ "out of": total, "graded": completed });
      }
    });
  },

  /**
 * This function gets the grading progress for each grader given assignment_id
 * @param {*} assigment_id
 * @param {*} grader_id
 */
  get_grading_progress_for_every_grader: function (req, res) {
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
  },

  /** returns a list of AssignmentGrader objects, which will be input in the 
   * algorithm. 
   * 
   * This method will query a list of all the graders, and create 
   * AssignmentGrader instances for each of those graders with their respective
   * id, current weight and offset, and the curr_assigned initialized to 0. 
   * 
   * @returns A new Promise object
   */
  get_grader_objects: function () {
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
  },

  update_grader_entries: function (grader_array, callback) {
    async.forEachOf(grader_array, function (grader, _, inner_callback) {
      let sql_query = "UPDATE grader SET offset=? WHERE id=?"
      db.query(sql_query, [grader.offset, grader.id], (err, results) => {
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






  // TO DO:
  // update grade in submission
  // 
  // 
  // get data for submssion given submission ID
  // 


}