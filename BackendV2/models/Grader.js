const pool = require('../pool');
var async = require('async');
const distrbute = require("../controllers/queries");

/**
 * Get weights, net_id, and offset, cap, total assigned for all graders given a assignment_id. 
 * Used for professor dashboard.
 * @param {*} req 
 * @param {*} res 
 */
module.exports.grader_info = function (assignment_id) {
    return new Promise(function(resolve, reject){
        let sql_query = "SELECT grader.name, grader.id, assignments_cap.cap, grader.offset, assignments_cap.total_assigned_for_assignment, grader.weight FROM grader INNER JOIN assignments_cap ON grader.id=assignments_cap.grader_id WHERE assignments_cap.assignment_id = ?";
        pool.query(sql_query, [assignment_id], async (error, results) => {
          if (error) {
            return reject(error)
          } else {
            let graderResponse = []
            for (let i = 0; i < results.length; i++) {
              let grader = results[i];
              let tempGraderObj = grader;
              let progressObj = await getNumGradedRatio(grader.id, assignment_id);
              tempGraderObj['progress'] = progressObj.ratio;
              tempGraderObj['num_graded'] = progressObj.num_graded;
              graderResponse.push(tempGraderObj);
            }
            resolve(graderResponse);
          }
        }
        );
    })
}


module.exports.updateGraderInfo = function (grader_object) {
    return new Promise(async function(resolve, reject){
      try{
          for(let i = 0; i<grader_object.length; i++){
            if(grader_object[i].weight != undefined){
              await updateWeight(grader_object[i].id, grader_object[i].weight)
            }
            if(grader_object[i].offset != undefined){
              await updateOffset(grader_object[i].id, grader_object[i].offset)
            }
            if(grader_object[i].cap != undefined){
              await updateCaps(grader_object[i].id, grader_object[i].assignment_id, grader_object[i].cap)
            }
          }
        return resolve()
      }catch(error){
        reject(error)
      }
  })
}

/**
 * Gets all of the users in the graders table 
 */
module.exports.getAll = async function() {
  return new Promise((resolve, reject) => {
    let query = "SELECT * FROM grader";
    pool.query(query, (err, results) => {
      if (err) {
        return reject(err)
      } else {
        return resolve(results)
      }
    })
  })
}

/**
 * Get the ratio of # done /assigned subs
 * @param {*} user_id 
 * @param {*} assignment_id 
 */
getNumGradedRatio = function (grader_id, assignment_id){
  return new Promise((resolve, reject) => {
    let query = "SELECT * FROM submission WHERE assignment_id =? AND grader_id = ?";
    pool.query(query, [assignment_id, grader_id], (err, results) => {
      if (err) {
        return reject(err)
      } else {
        if(results.length == null | results.length == undefined | results.length == 0){return resolve(0)}
        let total_gradered = 0
        results.map(submission =>{
          if(submission.is_graded == 1){
            total_gradered+=1
          }
        })
        let progressObj =  {"num_graded": total_gradered,"ratio": (total_gradered/results.length)*100}
        resolve(progressObj)
      }
    });
  })
}


/**
 * Update grader weight
 */
function updateWeight(grader_id, weight) {
  return new Promise(function(resolve, reject){
    let sql_query = "UPDATE grader SET weight = ? WHERE id = ?";
    pool.query(sql_query, [weight, grader_id], (error) => {
      if (error) {
        return reject(error)
      } else {
        return resolve()
      }
    }
    );
  })
}

/**
 * Update grader offset
 */
function updateOffset(grader_id, offset){
  return new Promise(function(resolve, reject){
    let sql_query = "UPDATE grader SET offset = ? WHERE id = ?";
    pool.query(sql_query, [offset, grader_id], (error) => {
      if (error) {
        return reject(error)
      } else {
        return resolve()
      }
    }
    );
  })
}

/**
 * Update grader caps and run algo 
 */
function updateCaps(grader_id, assignment_id, cap) {
  return new Promise(function(resolve, reject){
    let sql_query = "UPDATE assignments_cap SET cap=? WHERE grader_id=? AND assignment_id=?";
    pool.getConnection(function (connectionError, connection) {
      if(connectionError){return reject(connectionError)}
      connection.beginTransaction(async function(startTransactionError){
        if(startTransactionError){return reject(startTransactionError)}

        connection.query(sql_query, [cap, grader_id, assignment_id], (sqlError) => {
          if (sqlError) {return reject(sqlError)}
          connection.commit(async function(commitError) {
            try{
              if (commitError) {
                connection.rollback(()=>{
                  return reject("Something happened when saving caps, please try again") 
                });
              }
              let successMessage = await distrbute.runPipeline(assignment_id);
              connection.release();
              return resolve(successMessage);
            }catch(error){
              connection.rollback(()=>{
                console.log('Rolling back')
                connection.release();
                return reject(error);
              });
            }
          });
        });
      });
    });
  })
}