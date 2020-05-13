
const grader = require('../models/Grader')
const assignmentsCap = require("../models/AssignmentCap");
const submissions = require('../models/Submission')
const axios = require('axios');

<<<<<<< HEAD
const config = {
  headers: {
    Authorization: 'Bearer 9713~8gLsbC5WwTWOwqv8U3RPK4KK0wcgFThoufCz7fsCwXKsM00w9jKRcqFsbAo8HvJJ',
    'Accept': 'application/json',
  },
};

module.exports.syncWithCanvas = async (req, res) => {
  try {
    //get the list of assigments from Canvas
    let assignments = await axios.get(`https://canvas.cornell.edu/api/v1/courses/15037/assignments?per_page=200`, config);
    assignments = assignments.data.filter(assignment => {
      return assignment.workflow_state === "published";
    });

    assignments = assignments.map(assignment => {
      return [assignment.id, assignment.name]
    });

    assignment_ids = assignments.map(assignment => {
      return assignment[0]
    })

    //get the list of all graders from Canvas 
    let list_of_graders = await axios.get(`https://canvas.cornell.edu/api/v1/courses/15037/enrollments?per_page=1000`, config);
    list_of_graders = list_of_graders.data.filter(enrollment => {
      return enrollment.type === "TeacherEnrollment";
    });

    //get user ID and insert into the DB table -- graders 
    await grader.insertGraders(list_of_graders);


    //populate assignment caps table with graders
    let graders = await grader.getAll();
    graders = graders.map(grader => grader.id);
    await assignmentsCap.insertForAssignmentsForUsers(assignment_ids, graders);

    //pull submissions for each assignment
    for (let i = 0; i < assignment_ids.length; i++) {
      await submissions.pull_submissions_from_canvas(assignment_ids[i])
=======
/**
 * Pull submissions, assigments, and GRADERS
 */
module.exports.syncWithCanvas = async (req, res) => {
    try{
        // get token 
        let configForCanvasReq = await grader.getCanvasReqConfig(req.user.id)
        //get the list of assigments 
          let assignments = await axios.get(`https://canvas.cornell.edu/api/v1/courses/15037/assignments?per_page=200`, configForCanvasReq);
          assignments = assignments.data.filter(assignment =>{
            return assignment.workflow_state == "published";
          });

          assignments = assignments.map(assignment =>{
              return [assignment.id, assignment.name]
          });

          assignment_ids = assignments.map(assignment =>{
              return assignment[0]
          })

        //populate assignment caps table with graders
        let graders = await grader.getAll();
        graders = graders.map(grader => grader.id);
        await assignmentsCap.insertForAssignmentsForUsers(assignment_ids, graders);

        //pull submissions for each assignment
        for(let i = 0; i< assignment_ids.length; i++){
            await submissions.pull_submissions_from_canvas(assignment_ids[i], configForCanvasReq)
        }

        //check if names of assigments updated
        res.send("Synced with Canvas");

    }catch(error){
        res.status(406).send(error.message)
>>>>>>> 52af82a3040f84153cc143d6682219922f8af658
    }

    //check if names of assigments updated
    res.send();
  } catch (error) {
    console.log(error)
    res.status(406).send(error)
  }
}