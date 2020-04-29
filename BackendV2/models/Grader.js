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
            reject(error)
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

/**
 * Update the set of graders' weight, cap, offset 
 */
module.exports.updateGraderInfo = function (grader_object) {
  return new Promise(function(resolve, reject){
    pool.getConnection(function (err, connection) {
      if (err) {reject(err)}
      let queries = []
      let queriesData = []
      let assigmentsCapChange = []
      grader_object.map(async function (grader) {
        for (const property in grader) {
          switch(property) {
            case 'weight':
              queries.push('UPDATE grader SET weight=? WHERE id=?')
              queriesData.push(grader['weight']);
              queriesData.push(grader['id']);
              break;
            case 'cap':
              queries.push('UPDATE assignments_cap SET cap=? WHERE grader_id=? AND assignment_id=?');
              queriesData.push(grader['cap']);
              queriesData.push(grader['id']);
              queriesData.push(grader['assignment_id']);
              assigmentsCapChange.push(grader['assignment_id'])
              break;
            case 'offset':
              queries.push('UPDATE grader SET offset=? WHERE id=?')
              queriesData.push(grader['offset']);
              queriesData.push(grader['id']);
              break;
            default:
          }
        }
      })

      connection.query(queries.join(';'),queriesData, (err, results) => {
        if (err) {reject(err)}
      });

      if(!assigmentsCapChange.length){
        resolve();
      }
      // Run algo since caps changed
      async.forEachOf(assigmentsCapChange, async function (assignment_id) {
        try{
          await distrbute.runPipeline(assignment_id);
          connection.release();
          resolve();
        }catch(error){
          reject(error)
          //also undo all of the changes done earler
        }
      });
    })
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

        if(results.length == null | results.length == undefined | results.length == 0){resolve(0)}

        let total_gradered = 0

        results.map(submission =>{
          console.log(submission.is_graded)
          if(submission.is_graded!=0){total_gradered+=1}
        })
        
        let progressObj =  {"num_graded": total_gradered,"ratio": (total_gradered/results.length)*100}
        resolve(progressObj)
      }
    });
  })
}