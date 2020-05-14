const pool = require('../pool');

/**
 * TODO
 */
module.exports.set_assignments_as_graded = function (submission_ids, assignment_id) {
    return new Promise((resolve, reject) => {
        let queries = [];
        let queriesData = [];
        submission_ids.forEach(id => {
            queries.push(`UPDATE submission SET is_graded = 1 WHERE user_id = ? AND assignment_id=?`)
            queriesData.push(id)
            queriesData.push(assignment_id)
        });
        if (queriesData != []) {
            pool.query(queries.join(';'), queriesData, (error) => {
                if (error) return reject(error)
                return resolve();
            })
        } else {
            return resolve();
        }
    })
}

