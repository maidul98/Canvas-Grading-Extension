const pool = require('../pool');

async function createDummyData(assignment_id) {

  let objects = []

  try {
    let promisePool = pool.promise();

    for (let i = 0; i < 200; i++) {
      let id = i;
      let grader_id = i;
      let is_graded = null;
      let updated_at = Date.now();
      let name = i;
      let user_id = Math.floor(Math.random() * 2000) + 1;

      let temp_obj = {
        id: id,
        grader_id: grader_id,
        assignment_id: assignment_id,
        is_graded: is_graded,
        updated_at: updated_at,
        name: name,
        user_id: user_id
      }

      objects.push(temp_obj);

      let query = "INSERT IGNORE INTO grader (id, name, offset, role, total_graded, weight, last_updated) VALUES (?, ?, ?, ?, ?, ?, ?)";
      await promisePool.query(query, [i, name, 0, 'TA', 0, Math.floor(Math.random() * 4), updated_at]);

      let query2 = "INSERT IGNORE INTO assignments_cap (assignment_id, grader_id, cap, total_assigned_for_assignment) VALUES (?, ?, ?, ?)";
      await promisePool.query(query2, [assignment_id, i, 100, 0]);

    }

    for (let i = 0; i < objects.length; i++) {
      let query = "INSERT IGNORE INTO submission (id, grader_id, assignment_id, is_graded, last_updated, name, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)";
      await promisePool.query(query, Object.values(objects[i]));
    }

  } catch (error) {
    console.log(error)
  }

  return objects;

}


console.log(createDummyData(1));