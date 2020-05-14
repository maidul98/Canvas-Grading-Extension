const grader = require('../models/Grader')
const assignmentsCap = require("../models/AssignmentCap");
const axios = require('axios');
const submissions = require('../models/Submission')
/**
 * Pull submissions, assigments, and graders
 */
module.exports.syncWithCanvas = async (req, res) => {
  try {
    let configForCanvasReq = await grader.getCanvasReqConfig(req.user.id)
    let type = req.params.type

    if(type == "graders"){
      let list_of_graders = await axios.get(`https://canvas.cornell.edu/api/v1/courses/${configForCanvasReq.course_id}/enrollments?per_page=1000`, configForCanvasReq.token);

      list_of_graders = list_of_graders.data.filter(enrollment => {
        return enrollment.type == 'TeacherEnrollment' || enrollment.type == 'TaEnrollment';
      });
  
      list_of_graders = list_of_graders.map(enrollment => {
        return enrollment.user;
      });

      let assignment_ids = (await submissions.getAllAssignments()).map((assignment)=>assignment.assignment_id);
      await grader.addNewGraders(list_of_graders);

      let graders = await grader.getAll();
      graders = graders.map(grader => grader.id);
      await assignmentsCap.insertForAssignmentsForUsers(assignment_ids, graders);
      
    }

    if(type == "submissions"){
      let assignment_ids = (await submissions.getAllAssignments()).map((assignment)=>assignment.assignment_id);
      for (let i = 0; i < assignment_ids.length; i++) {
        await submissions.pull_submissions_from_canvas(assignment_ids[i], configForCanvasReq)
      }
    }

    if(type == "assignments"){
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

      let graders = await grader.getAll();
      graders = graders.map(grader => grader.id);
      await assignmentsCap.insertForAssignmentsForUsers(assignment_ids, graders);

    }

    res.send("Synced with Canvas");
  } catch (error) {
    console.log(error)
    if (error.type == "CGE") {
      res.status(400).send(error.message)
    } else {
      res.status(500).send("Something went wrong, please try again later")
    }
    // console.log(error)
  }
}