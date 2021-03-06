const pool = require('../pool');
const axios = require('axios');



/**
 * Returns the number of submissions that have not been assigned a grader yet
 * for a specific [assignment_id]. 
 */
module.exports.get_unassigned_submissions = async function (assignment_id) {
    try {

        const promisePool = pool.promise();
        let sql_query = 'SELECT * FROM submission WHERE grader_id IS NULL AND assignment_id = ?';
        const [row, fields] = await promisePool.query(sql_query, [assignment_id]);

        return row.length;
    } catch (error) {
        return new Error('There was an error in fetching the number of unassigned submissions.');
    }
};


/**
 * Returns array of assigned submissions for every grader for an assignment:
 * {grader1_id: [submission1_id, submission2_id], grader2_id: [submission3_id, submission4_id]}
 * @param {*} req 
 * @param {*} res 
 */
module.exports.get_assigned = async function (assignment_id, user_id) {
    try {
        console.log('getting subs for this user');
        const promisePool = pool.promise();
        let sql_query = 'SELECT * FROM submission WHERE assignment_id=? AND grader_id=?';
        let [submissions, _] = await promisePool.query(sql_query, [assignment_id, user_id]);
        console.log(submissions);
        return submissions;
    } catch (e) {
        throw {
            type: 'CGE',
            message: 'Something went wrong when fetching assigned submissions'
        };
    }
};


/**
 * Adds new submissions from Canvas by assignment_id into DB
 * @param {Number} assignment_id The assignment ID
 */
module.exports.pull_submissions_from_canvas = function (assignment_id, configForCanvasReq) {
    return new Promise(async function (resolve, reject) {
        try {
            let response = await axios.get(`https://canvas.cornell.edu/api/v1/courses/${configForCanvasReq.course_id}/assignments/${assignment_id}/submissions?include[]=group&include[]=submission_comments&include[]=user&include[]=assignment&per_page=3000`, configForCanvasReq.token);

            dbJSON = [];
            visitedGroups = new Set();
            response.data.forEach(element => {
                if (element.workflow_state === 'submitted' || element.workflow_state === 'graded') {
                    json = {
                        id: element.id,
                        grader_id: element.grader_id,
                        assignment_id: element.assignment_id,
                        is_graded: element.graded_at != null,
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
                if (err) throw reject(new Error('Could not fetch submmissions from Canvas.'));
                dbJSON.forEach(e => {
                    let id = e.id;
                    let grader_id = e.grader_id;
                    let assignment_id = e.assignment_id;
                    let is_graded = e.is_graded;
                    let last_updated = e.updated_at.replace('T', ' ').replace('Z', '');
                    let name = e.name;
                    let user_id = e.user_id;
                    let assignment_name = e.assignment_name;

                    let query = 'INSERT IGNORE INTO submission (id, grader_id, assignment_id, is_graded, last_updated, name, user_id, assignment_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
                    let data = [id, grader_id, assignment_id, is_graded, last_updated, name, user_id, assignment_name];
                    connection.query(query, data);
                });
                connection.release();
                resolve();
            });
        } catch (error) {
            reject(error);
        }
    });
};


/**
 * Get all assignment_ids and their name
 */
module.exports.getAllAssignments = async function () {
    let promisePool = pool.promise();
    let query = 'SELECT DISTINCT assignment_id, assignment_name, assignment_id FROM submission';
    const [rows, fields] = await promisePool.query(query);
    return rows;
};
