 /**
  * @param {*} grader_array 
  * @param {*} callback 
  */
 exports.update_grader_entries = function update_grader_entries(grader_array, callback) {
    async.forEachOf(grader_array, function (grader, _, inner_callback) {
      let query = "UPDATE grader SET offset=? WHERE id=?"
      let data = [grader.offset, grader.grader_id]
  
      db.getConnection(function (err, connection) {
        if (err) throw err;
        connection.query(query, data, (err, results) => {
          connection.release();
          if (err) {
            console.log(err)
            inner_callback(err)
            callback(err)
          } else {
            inner_callback(null)
          }
        })
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
exports.insertSingleGrader = function (id, name, offset, role, total_graded, weight, last_updated) {
    let query = "INSERT IGNORE INTO grader (id, name, offset, role, total_graded, weight, last_updated) VALUES (?, ?, ?, ?, ?, ?, ?)";
    let data = [id, name, offset, role, total_graded, weight, last_updated]
  
    db.getConnection(function (err, connection) {
      if (err) throw err;
      connection.query(query, data);
      connection.release();
    });
};


/**
 * @param {*} graders_arr: [{"id": 123, "weight": 5, "offset": -1}, {"id": 234, "offset": 0}, {"id: 345", "weight": 3}]
 * @param {*} callback
 */
exports.update_multiple_graders_data = function (graders_arr, callback) {
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
exports.update_single_grader_data = function (grader_id, grader_obj, callback) {
    let sql_query = "UPDATE grader SET ? WHERE id = ?";
    db.query(sql_query, [grader_obj, grader_id], callback)
}


/**
 * This function takes in a grader_id and updates the weight for that grader
 * @param {*} grader_id
 * @param {*} weight 
 */
exportsupdate_grader_weight =  function(req, res) {
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
* This function gets the grading progress for each grader given assignment_id
* @param {*} assigment_id
*/
exports.get_grading_progress_for_every_grader = function(req, res) {
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