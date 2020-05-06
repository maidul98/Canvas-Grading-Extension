var express = require('express');
var router = express.Router();
var controllers = require('../controllers/');


/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', { title: 'Backend' });
});

/** ASSIGNED SUBMISSION BY ASSIGMNET ID*/
router.get('/get-assigned-submissions-for-assigment', controllers.SubmissionsController.assigned); // use 


/** Get grading progress for a specific assignment */
router.get('/get-grader-info', controllers.ProfessorDashboardController.getGraderInfo);


/*UPDATE GRADER WEIGHT, CAPS, OFFSET*/
router.post('/update-grader-info', controllers.ProfessorDashboardController.updateGraderInfo);


/*REQUESTS TO CANVAS API */
router.post('/canvas-api', controllers.CanvasAPIController.GET_all);


/*POPULATE ASSIGNMENT CAPS TABLE*/
router.post('/check-for-new-assignments', controllers.AssignmentsCapController.populateAssignmentsCapTable)


/*DOWNLOAD SUBMISSIONS*/
router.post('/download-submission', controllers.DownloadController.downloadSubmissions)


/*DISTRIBUTION PIPELINE*/
router.post('/distribute', controllers.ProfessorDashboardController.runDisturbation);


/*GRADE PASS BACK*/
router.post('/upload-submission-grades/assignments/:assignment_id/submissions/batch-update-grades', controllers.GradingController.batchGrade);


module.exports = router;
