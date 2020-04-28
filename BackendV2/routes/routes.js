/**
 * This file will define all the routes needed for this project. Do not put any 
 * logic in this file - this is simply meant to define the endpoints we need to
 * set up and use. Put the relevant logic in api-call.js or queries.js
 * appropriately. 
 */
var express = require('express');
var router = express.Router();
var apiCalls = require('../controllers/api-calls');
var queries = require('../controllers/queries');
var download = require('../controllers/DownloadController');

//Imports all files from the controllers folder
var controllers = require('../controllers/');


/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', { title: 'Express' });
});

/** Request for submissions */

/** Get all student enrollments */
router.get('/student-enrollments', apiCalls.student_enrollments);

//TODO: create database queries in another file
// router.get('/datatest', queries.get_submission_table);
// router.get('/assignments', queries.get_assignments_table);

/** Get assignment list */
router.get('/get-published-assignments', apiCalls.get_published_assignments);

/** Get assignments for specific submission */
// router.get('/get-submissions/:assignment_id', apiCalls.get_submissions_for_assignment);

/** Get single submission */
// router.get('/single-submission/:assignment_id/submissions/:user_id', apiCalls.get_single_submission);

/** Get all graders for enrolled on Canvas */
router.get('/get-graders', apiCalls.get_all_graders);

/** Upload grades and comments for a specific user's submission for an assignment */
router.put('/upload-submission-grades/assignments/:assignment_id/submissions/:user_id', apiCalls.grade_single_submission);

/** Uploads all grades and comments for all submissions for a specific assignment */
router.post('/upload-submission-grades/assignments/:assignment_id/submissions/batch-update-grades', apiCalls.grade_batch_submissions);

/** Get all assigned submissions for a specific submission */
router.get('/get-assigned-submissions-for-assigment', queries.get_assigned_submission_for_assigment);

router.get('/get-assigned-submissions-for-graders', queries.get_assigned_submissions_for_graders);

/** Get all unassigned submissions */
// router.get('/get-unassigned-submissions', queries.get_unassigned_submissions);

/** Get grader table */
// router.get('/get-grader-table', queries.get_grader_table);

/** Update weight for a specific grader */
router.post('/update-grader-weight', queries.update_grader_weight);

/** Update data for multiple graders */
router.post('/update-graders-data', queries.update_multiple_graders_data_route);


/** Get grading progress for a specific assignment */
router.get('/get-grader-info', controllers.ProfessorDashboardController.getGraderInfo);

router.post('/update-grader-info', controllers.ProfessorDashboardController.updateGraderInfo);

/** Get grading progress for a specific assignment */
// router.get('/get-grading-progress-for-every-grader', queries.get_grading_progress_for_every_grader);

/** Downloads a specific user's submission for a specific assignment */
router.get('/download-submission/assignments/:assignment_id/submissions/:user_id', apiCalls.download_single_submission);

// router.put('/pull-submissions-and-update/:assignment_id', apiCalls.pull_submissions_and_update_for_assignment)

router.post('/canvas-api', apiCalls.GETcanvas_API_call);

router.put('/canvas-api', apiCalls.PUTcanvas_API_call);

/** Runs the entire assignments-distribution pipeline & updates the database. */
router.post('/distribute', queries.run_distribution_pipeline)

//Params: assignment_id, [user_ids]
router.post('/download-submission', download.downloadSubmissions)

//testing for handling conflict 
router.post('/test_handle', async (req, res) => {
    await queries.handle_conflicts(4, 3, 109377);
    res.send("succesful yay")
})

router.post('/check-for-new-assignments', controllers.AssignmentsCapController.populateAssignmentsCapTable)

//Params: assignment_id, [user_ids]
router.post('/update-gradercap', queries.update_caps)

//NEED TO UPDATEEEEEE!!!
router.get('/get-assignment-cap', (req, res) => {
    queries.get_assignment_cap(1234).then(response => res.send(response));
});

module.exports = router;
