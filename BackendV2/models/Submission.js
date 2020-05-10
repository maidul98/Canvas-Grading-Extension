const pool = require('../pool');
const axios = require('axios');


/**
 * Returns the assigned submissions for every grader for an assignment:
 * {grader1_id: [submission1_id, submission2_id], grader2_id: [submission3_id, submission4_id]}
 * @param {*} req 
 * @param {*} res 
 */
module.exports.get_assigned = function (assigment_id, user_id) {
    return new Promise(function(reslove, reject){
        let sql_query = "SELECT * FROM submission WHERE assignment_id=? AND grader_id=?";
        pool.query(
            sql_query, [assigment_id, user_id],
            function (err, results) {
            if (err) {
                reject(err)
            } else {
                reslove(results)
            }
            }
        );
    });
}


/**
 * Adds new submissions from Canvas by assignment_id into DB
 * @param {Number} assignment_id The assignment ID
 */
module.exports.pull_submissions_from_canvas = function (assignment_id) {
    return new Promise(async function (resolve, reject) {
      const config = {
        headers: {
          Authorization: 'Bearer 9713~8gLsbC5WwTWOwqv8U3RPK4KK0wcgFThoufCz7fsCwXKsM00w9jKRcqFsbAo8HvJJ',
          'Accept': 'application/json',
        },
      };
      try {
        let response = await axios.get(`https://canvas.cornell.edu/api/v1/courses/15037/assignments/${assignment_id}/submissions?include[]=group&include[]=submission_comments&include[]=user&include[]=assignment&per_page=3000`, config)
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
              name: element.user.login_id,
              user_id: element.user.id,
              assignment_name: element.assignment.name
  
            };
    
            if (element.group.id !== null && !visitedGroups.has(element.group.id)) {
              visitedGroups.add(element.group.id);
              dbJSON.push(json);
            } else if (element.group.id === null) {
              dbJSON.push(json);
            }
          }
        });
    
        pool.getConnection(function (err, connection) {//add the pulled submissions to the DB
          if (err) throw reject(err);
          dbJSON.forEach(e => {
            let id = e.id;
            let grader_id = e.grader_id;
            let assignment_id = e.assignment_id;
            let is_graded = e.is_graded;
            let last_updated = e.updated_at.replace("T", " ").replace("Z", "");
            let name = e.name;
            let user_id = e.user_id
            let assignment_name = e.assignment_name
  
            let query = "INSERT IGNORE INTO submission (id, grader_id, assignment_id, is_graded, last_updated, name, user_id, assignment_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
            let data = [id, grader_id, assignment_id, is_graded, last_updated, name, user_id, assignment_name]
            connection.query(query, data);
          });
          connection.release();
          resolve()
        })
      } catch (error) {
        reject(error)
      }
    })
  };


  /**
   * Get all assignment_ids and their name
   */
  module.exports.getAllAssignments = async function(){
      let promisePool = pool.promise();
      let query = "SELECT DISTINCT assignment_id, assignment_name FROM submission";
      const [rows,fields] = await promisePool.query(query);
      return rows
  }