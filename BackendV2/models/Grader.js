const pool = require('../pool');

/**
 * Get weights, net_id, and offset, cap, total assigned for all graders given a assignment_id. 
 * Used for professor dashboard.
 * @param {*} req 
 * @param {*} res 
 */
module.exports.grader_info = function (assignment_id) {
    return new Promise(function (resolve, reject) {
        let sql_query = 'SELECT grader.name, grader.id, assignments_cap.cap, grader.offset, assignments_cap.total_assigned_for_assignment, grader.weight FROM grader INNER JOIN assignments_cap ON grader.id=assignments_cap.grader_id WHERE assignments_cap.assignment_id = ?';
        pool.query(sql_query, [assignment_id], async (error, results) => {
            if (error) {
                return reject(error);
            } else {
                let graderResponse = [];
                for (let i = 0; i < results.length; i++) {
                    let grader = results[i];
                    let tempGraderObj = grader;
                    let progressObj = await getNumGradedRatio(grader.id, assignment_id);
                    tempGraderObj['progress'] = progressObj.ratio;
                    tempGraderObj['num_graded'] = progressObj.num_graded;
                    tempGraderObj['assignment_id'] = assignment_id;
                    graderResponse.push(tempGraderObj);
                }
                resolve(graderResponse);
            }
        }
        );
    });
};

/**
 * Adds [graders] into Canvas. 
 */
module.exports.addNewGraders = async function (graders) {
    try {
        const promisePool = pool.promise();
        for (let i = 0; i < graders.length; i++) {
            let sql_query = 'INSERT IGNORE INTO grader (id, name, last_updated, email) VALUES (?, ?, ?, ?)';
            await promisePool.query(sql_query, [graders[i].id, graders[i].login_id, Date.now(), `${graders[i].login_id}@cornell.edu`]);
        }
        return resolve();
    } catch (error) {
        return new Error('There was an error in syncing graders.');
    }
};




module.exports.updateGraderInfo = function (grader_object) {
    return new Promise(async function (resolve, reject) {
        try {
            const promisePool = pool.promise();
            for (let i = 0; i < grader_object.length; i++) {
                if (grader_object[i].weight != undefined) {
                    let sql_query = 'UPDATE grader SET weight = ? WHERE id = ?';
                    await promisePool.query(sql_query, [grader_object[i].weight, grader_object[i].id]);
                }
                if (grader_object[i].offset != undefined) {
                    let sql_query = 'UPDATE grader SET offset = ? WHERE id = ?';
                    await promisePool.query(sql_query, [grader_object[i].offset, grader_object[i].id]);
                }
                if (grader_object[i].cap != undefined) {
                    let sql_query = 'UPDATE assignments_cap SET cap=? WHERE grader_id=? AND assignment_id=?';
                    await promisePool.query(sql_query, [grader_object[i].cap, grader_object[i].id, grader_object[i].assignment_id]);
                }
            }
            return resolve();
        } catch (error) {
            reject(error);
        }
    });
};

/**
 * Gets all of the users in the graders table 
 */
module.exports.getAll = async function () {
    return new Promise((resolve, reject) => {
        let query = 'SELECT * FROM grader';
        pool.query(query, (err, results) => {
            if (err) {
                return reject(err);
            } else {
                return resolve(results);
            }
        });
    });
};

/**
 * Get the ratio of # done /assigned subs
 * @param {*} user_id 
 * @param {*} assignment_id 
 */
getNumGradedRatio = function (grader_id, assignment_id) {
    return new Promise((resolve, reject) => {
        let query = 'SELECT * FROM submission WHERE assignment_id =? AND grader_id = ?';
        pool.query(query, [assignment_id, grader_id], (err, results) => {
            if (err) {
                return reject(err);
            } else {
                if (results.length == null | results.length == undefined | results.length == 0) { return resolve(0); }
                let total_gradered = 0;
                results.map(submission => {
                    if (submission.is_graded == 1) {
                        total_gradered += 1;
                    }
                });
                let progressObj = { 'num_graded': total_gradered, 'ratio': (total_gradered / results.length) * 100 };
                resolve(progressObj);
            }
        });
    });
};

/**
 * Returns a boolean on whether user with email exists in DB
 */
module.exports.userWithEmailExists = async function (email) {
    try {
        let promisePool = pool.promise();
        const [user, fields] = await promisePool.query('SELECT * from grader where email=?', [email]);
        if (user == [] | user == undefined | user.length == 0) {
            return false;
        }
        return user[0];
    } catch (error) {
        throw error;
    }
};


