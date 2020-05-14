const grader = require('../models/Grader');
const assignmentsCap = require('../models/AssignmentCap');
const axios = require('axios');
const submissions = require('../models/Submission');
const canvas = require('../models/Canvas');
/**
 * Pull submissions, assigments, and graders
 */
module.exports.syncWithCanvas = async (req, res) => {
    try {
        let configForCanvasReq = await canvas.getCanvasReqConfig(req.user.id);
        let type = req.params.type;

        if(type == 'graders'){
            let list_of_graders = await axios.get(`https://canvas.cornell.edu/api/v1/courses/${configForCanvasReq.course_id}/enrollments?per_page=1000`, configForCanvasReq.token);

            list_of_graders = list_of_graders.data.filter(enrollment => {
                return enrollment.type == 'TeacherEnrollment' || enrollment.type == 'TaEnrollment';
            });
  
            list_of_graders = list_of_graders.map(enrollment => {
                return enrollment.user;
            });

            let assignment_ids = (await submissions.getAllAssignments()).map((assignment)=>assignment.assignment_id);
            await grader.addNewGraders(list_of_graders);
            grader_ids = list_of_graders.map(grader => grader.id);
            await assignmentsCap.insertForAssignmentsForUsers(assignment_ids, grader_ids);
      
        }

        if(type == 'submissions and assignments'){
            let assignments = await axios.get(`https://canvas.cornell.edu/api/v1/courses/${configForCanvasReq.course_id}/assignments?per_page=200`, configForCanvasReq.token);
            assignments = assignments.data.filter(assignment => {
                return assignment.workflow_state == 'published';
            });
            assignments = assignments.map(assignment => {
                return [assignment.id, assignment.name];
            });
            assignment_ids = assignments.map(assignment => {
                return assignment[0];
            });

            let graders = (await grader.getAll()).map(grader => grader.id);
            await assignmentsCap.insertForAssignmentsForUsers(assignment_ids, graders);

            for (let i = 0; i < assignment_ids.length; i++) {
                await submissions.pull_submissions_from_canvas(assignment_ids[i], configForCanvasReq);
            }
        }

        res.send('Synced with Canvas');
    } catch (error) {
        console.log(error);
        if (error.type == 'CGE') {
            res.status(400).send(error.message);
        } else {
            res.status(500).send('Something went wrong, please try again later');
        }
    // console.log(error)
    }
};