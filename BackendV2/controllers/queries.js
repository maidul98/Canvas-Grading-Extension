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
var db = mysql.createConnection({
  host: "us-cdbr-iron-east-04.cleardb.net",
  user: "be9696052936bb",
  password: "4f1c4dfa",
  database: "heroku_aff64052225438d",
  port: 3306,
  connectTimeout: 100000,
  max_questions: 5000
});

//Initialize connection
// db.connect((err) => {
//   if (err) {
//     throw err;
//   }
//   console.log('Connected to database');
// });

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
        res.send(result);
      }
    });
  };
}
/** Gets the submission table */
exports.get_submission_table = createQueryFunction("submission");

/** Gets the assignments table */
exports.get_assignments_table = createQueryFunction("assignments");
