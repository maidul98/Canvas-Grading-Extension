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
  let sql_query = "INSERT IGNORE INTO assignments (id, name, due_date, last_updated, points_possible) VALUES (?, ?, ?, ?)";
  db.query(sql_query, [id, name, due_date, last_updated, points_possible], (err, result) => {
    if (err) {
      console.log(err);
    }
  });
};

function insertSingleGrader(id, name, offset, role, total_graded, weight, last_updated) {
  let sql_query = "INSERT IGNORE INTO graders (id, name, offset, role, total_graded, weight, last_updated)";
  db.query(sql_query, [id, name, offset, role, total_graded, weight, last_updated], (err, result) => {
    if (err) {
      console.log(err);
    }
  })
};

function insertSingleSubmission(id, grader_id, assignment_id, is_graded, last_updated, grade) {
  let sql_query = "INSERT IGNORE INTO submissions (id, grader_id, assignment_id, is_graded, last_updated, grade)";
  db.query(sql_query, [id, grader_id, assignment_id, is_graded, last_updated, grade], (err, result) => {
    if (err) {
      console.log(err);
    }
  });


}

/**
 * Takes a JSON string for published assignments, parses it, and inserts each assignment into 
 * @param {*} json_string 
 */
module.exports = {

  insertPublishedAssignments: function (json_string) {
    let assignments = json_string;
    assignments.forEach(e => {
      let id = e.id;
      let name = e.name;
      let due_date = e.due_at;
      let last_updated = e.updated_at.replace("T", " ").replace("Z", "");
      let points_possible = e.points_possible
      insertSingleAssignment(id, name, due_date, last_updated, points_possible);
    });
  },

  insertAllSubmissions: function (json_string) {
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
    let sql_query = "INSERT IGNORE INTO conflicts (id, grader_id, reason, approved, reassigned_grader_id, submission_id)";
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
      let global_offset = 0;

      let grader_position;
      if (e.type == 'TaEnrollment') {
        grader_position = "TA";
      } else if (e.type == "ObserverEnrollment") {
        grader_position = "Grader";
      } else {
        grader_position = "Consultant";
      }

      let total_graded = 0;
      let weight = -1;
      let last_updated = e.updated_at.replace("T", " ").replace("Z", "");
  
      insertSingleGrader(id, grader_name, global_offset, grader_position, total_graded, weight, last_updated);
    })
  }
}


// var example = '[{"id":93965,"description":"","due_at":"2020-03-02T04:59:59Z","unlock_at":"2020-02-20T05:00:00Z","lock_at":"2020-03-04T04:59:59Z","points_possible":100,"grading_type":"points","assignment_group_id":41330,"grading_standard_id":null,"created_at":"2020-02-21T02:23:45Z","updated_at":"2020-03-01T22:24:13Z","peer_reviews":false,"automatic_peer_reviews":false,"position":1,"grade_group_students_individually":false,"anonymous_peer_reviews":false,"group_category_id":3159,"post_to_sis":false,"moderated_grading":false,"omit_from_final_grade":false,"intra_group_peer_reviews":false,"anonymous_instructor_annotations":false,"anonymous_grading":false,"graders_anonymous_to_graders":false,"grader_count":0,"grader_comments_visible_to_graders":true,"final_grader_id":null,"grader_names_visible_to_final_grader":true,"allowed_attempts":-1,"secure_params":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJsdGlfYXNzaWdubWVudF9pZCI6IjAxZTcyMjQ3LTc5MDYtNDE1ZC05NDIzLTMzMTVhYWI2YjdiMSJ9.MpG-MrYgKLfit0P6hFIYdLp95NRyc7pnmJ4j2MMR-iw","course_id":15037,"name":"Test1","submission_types":["online_upload"],"has_submitted_submissions":false,"due_date_required":false,"max_name_length":255,"in_closed_grading_period":false,"is_quiz_assignment":false,"can_duplicate":true,"original_course_id":null,"original_assignment_id":null,"original_assignment_name":null,"original_quiz_id":null,"workflow_state":"published","muted":true,"html_url":"https://canvas.cornell.edu/courses/15037/assignments/93965","has_overrides":false,"needs_grading_count":0,"sis_assignment_id":null,"integration_id":null,"integration_data":{},"allowed_extensions":["docx","pdf"],"published":true,"unpublishable":true,"only_visible_to_overrides":false,"locked_for_user":false,"submissions_download_url":"https://canvas.cornell.edu/courses/15037/assignments/93965/submissions?zip=1","post_manually":true,"anonymize_students":false,"require_lockdown_browser":false},{"id":95055,"description":null,"due_at":null,"unlock_at":null,"lock_at":null,"points_possible":null,"grading_type":"points","assignment_group_id":41330,"grading_standard_id":null,"created_at":"2020-02-28T02:50:55Z","updated_at":"2020-02-28T02:51:16Z","peer_reviews":false,"automatic_peer_reviews":false,"position":2,"grade_group_students_individually":false,"anonymous_peer_reviews":false,"group_category_id":null,"post_to_sis":false,"moderated_grading":false,"omit_from_final_grade":false,"intra_group_peer_reviews":false,"anonymous_instructor_annotations":false,"anonymous_grading":false,"graders_anonymous_to_graders":false,"grader_count":0,"grader_comments_visible_to_graders":true,"final_grader_id":null,"grader_names_visible_to_final_grader":true,"allowed_attempts":-1,"secure_params":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJsdGlfYXNzaWdubWVudF9pZCI6ImIxMmIzMWJhLTRmYWYtNDU4OC05ZDBlLTk3YWViZjMyOGQ3NSJ9.WLNxNdC0qxiGISJXquIyumCWe8fxa6YzU74fgA0OD24","course_id":15037,"name":"Project 1","submission_types":["none"],"has_submitted_submissions":false,"due_date_required":false,"max_name_length":255,"in_closed_grading_period":false,"is_quiz_assignment":false,"can_duplicate":true,"original_course_id":null,"original_assignment_id":null,"original_assignment_name":null,"original_quiz_id":null,"workflow_state":"published","muted":true,"html_url":"https://canvas.cornell.edu/courses/15037/assignments/95055","has_overrides":false,"needs_grading_count":0,"sis_assignment_id":null,"integration_id":null,"integration_data":{},"published":true,"unpublishable":true,"only_visible_to_overrides":false,"locked_for_user":false,"submissions_download_url":"https://canvas.cornell.edu/courses/15037/assignments/95055/submissions?zip=1","post_manually":true,"anonymize_students":false,"require_lockdown_browser":false}]'

// insertPublishedAssignments(example);

/** Gets the submission table */
exports.get_submission_table = createQueryFunction("submission");

/** Gets the assignments table */
exports.get_assignments_table = createQueryFunction("assignments");
