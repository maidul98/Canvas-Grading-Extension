/**
 * This file will store the logic behind all the database queries. All functions
 * defined here will deal with retrieving or pushing data from the 
 * MySQL database. 
 */
var mysql = require('mysql');

/** Configure Heroku Connection */
/** TODO: Store all these constants in a separate file, gitignore it and figure 
 * out deployment mechanism - where will these pins be stored? That is a later 
 * problem */
var db = mysql.createPool({
  host: "us-cdbr-iron-east-04.cleardb.net",
  user: "be9696052936bb",
  password: "4f1c4dfa",
  database: "heroku_aff64052225438d",
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
function insertSingleAssignment(id, name, due_date, last_updated, points_possible) {
  let sql_query = "INSERT IGNORE INTO assignment (id, name, due_date, last_updated, points_possible) VALUES (?, ?, ?, ?)";
  db.query(sql_query, [id, name, due_date, last_updated, points_possible], (err, result) => {
    if (err) {
      console.log(err);
    }
  });
};

function insertSingleGrader(id, name, offset, role, total_graded, weight, last_updated) {
  let sql_query = "INSERT IGNORE INTO grader (id, name, offset, role, total_graded, weight, last_updated)";
  db.query(sql_query, [id, name, offset, role, total_graded, weight, last_updated], (err, result) => {
    if (err) {
      console.log(err);
    }
  })
};

function insertSingleSubmission(id, grader_id, assignment_id, is_graded, last_updated, grade) {
  let sql_query = "INSERT IGNORE INTO submission (id, grader_id, assignment_id, is_graded, last_updated, grade)";
  db.query(sql_query, [id, grader_id, assignment_id, is_graded, last_updated, grade], (err, result) => {
    if (err) {
      console.log(err);
    }
  });
}


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
    let sql_query = "INSERT IGNORE INTO conflict (id, grader_id, reason, approved, reassigned_grader_id, submission_id)";
    db.query(sql_query, [id, grader_id, reason, approved, reassigned_grader_id, submission_id], (err, _) => {
      if (err) {
        console.log(err);
      }
    })
  },

  insertAllgrader: function (json_string) {
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

    let total_graded = 0;
    let weight = -1;
    let last_updated = e.updated_at.replace("T", " ").replace("Z", "");

    insertSingleGrader(id, grader_name, global_offset, grader_position, total_graded, weight, last_updated);
  },

/**
 * This function takes in user_id and assigment_id and returns the list of submission that are assigned for that user
 * user that assigment
 * @param {*} user_id 
 * @param {*} assigment_id 
 **/
  get_assigned_submission_for_assigment: function (req, res) {
    let sql_query = "SELECT * FROM submission WHERE assignment_id=? AND grader_id=?";
    db.query(
      sql_query,[req.query.assigment_id, req.query.user_id], 
      function (err, results) {
        if (err) {
          console.log(erri);
        }else{
          res.json(results);
        }
      }
    );
  },



  // TO DO:
  // update grade in submission
  // 
  // 
  // get data for submssion given submission ID
  // 


}

/** Gets the submission table */
exports.get_submission_table = createQueryFunction("submission");

/** Gets the assignment table */
exports.get_assignment_table = createQueryFunction("assignment");
