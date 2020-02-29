var mysql = require('mysql');

var db = mysql.createConnection({
  host: "us-cdbr-iron-east-04.cleardb.net",
  user: "be9696052936bb",
  password: "4f1c4dfa",
  database: "heroku_aff64052225438d"
});

db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log('Connected to database');
});

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

exports.get_submission_table = createQueryFunction("submission");

exports.get_assignments_table = createQueryFunction("assignments");
