const pool = require('../pool');

/**
 * Deletes all entries in all of the tables in the DB. 
 */
module.exports.deleteDB = async (_, res) => {
  try {
    let promisePool = pool.promise();
    let query = "TRUNCATE TABLE submission; TRUNCATE TABLE assignments_cap; delete from grader where role NOT IN(`PROFESSOR`)";
    await promisePool.query(query);
    res.send("Successfully deleted all entries from all tables of the DB.");
  } catch (error) {
    res.status(500).send("Something went wrong with clearing the course.")
  }
}
