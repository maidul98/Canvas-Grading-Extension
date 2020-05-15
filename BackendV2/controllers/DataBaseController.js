const pool = require('../pool');

/**
 * Deletes all entries in all of the tables in the DB. 
 */
module.exports.deleteDB = async (req, res) => {
    try {
        if (req.user.role === 'PROFESSOR') {
            let promisePool = pool.promise();
            let query = 'UPDATE course_info SET course_id = null where id=1; TRUNCATE TABLE submission; TRUNCATE TABLE assignments_cap; DELETE FROM grader WHERE role != \'PROFESSOR\'';
            await promisePool.query(query);
            res.send('Successfully deleted all entries from all tables of the DB.');
        }
        else {
            throw new Error("You must be a professor to delete the course data.");
        }

    } catch (error) {
        console.log(error);
        res.status(500).send('Something went wrong with clearing the course.');
    }
};
