const grader = require('../models/Grader')
const assignmentsCap = require("../models/AssignmentCap");
const submissions = require('../models/Submission')
const axios = require('axios');
/**
 * Pull submissions, assigments, and GRADERS
 */
module.exports.syncWithCanvas = async (req, res) => {
  try {
    // get token 
    let configForCanvasReq = await grader.getCanvasReqConfig(req.user.id)

    //get the list of assigments 
    let assignments = await axios.get(`https://canvas.cornell.edu/api/v1/courses/${configForCanvasReq.course_id}/assignments?per_page=200`, configForCanvasReq.token);
    assignments = assignments.data.filter(assignment => {
      return assignment.workflow_state == "published";
    });
    assignments = assignments.map(assignment => {
      return [assignment.id, assignment.name]
    });
    assignment_ids = assignments.map(assignment => {
      return assignment[0]
    })

    // //get the list of all graders from Canvas 
    let list_of_graders = await axios.get(`https://canvas.cornell.edu/api/v1/courses/${configForCanvasReq.course_id}/enrollments?per_page=1000`, configForCanvasReq.token);

    list_of_graders = list_of_graders.data.filter(enrollment => {
      return enrollment.role == 'TeacherEnrollment' || enrollment.role == 'TaEnrollment';
    });

    list_of_graders = list_of_graders.map(enrollment => {
      return enrollment.user;
    });


    await grader.addNewGraders(list_of_graders);


    //populate assignment caps table with graders
    let graders = await grader.getAll();
    graders = graders.map(grader => grader.id);
    await assignmentsCap.insertForAssignmentsForUsers(assignment_ids, graders);
    //pull submissions for each assignment
    for (let i = 0; i < assignment_ids.length; i++) {
      await submissions.pull_submissions_from_canvas(assignment_ids[i], configForCanvasReq)
    }

    //check if names of assigments updated
    res.send("Synced with Canvas");
  } catch (error) {
    if(error.type == "CGE"){
      res.status(400).send(error.message)
    }else{
      res.status(500).send("Something went wrong, please try again later")
    }

    console.log(error)
  }
}