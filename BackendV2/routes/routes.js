var express = require('express');
var router = express.Router();
var controllers = require('../controllers/');

/* DELETE all entires of all tables in the DB. */
router.get('/delete-data-base', controllers.DataBaseController.deleteDB);


/**
 * GET the number of submissions that have no grader for an assignment. 
 */
router.get('/unassigned-submissions/:assignment_id', controllers.ProfessorDashboardController.getUnassignedSubmissions);


/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', { title: 'Backend' });
});

/** ASSIGNED SUBMISSION BY ASSIGMNET ID*/
router.get('/get-assigned-submissions-for-assigment', controllers.SubmissionsController.assigned);


/** Get grading progress for a specific assignment */
router.get('/get-grader-info', controllers.ProfessorDashboardController.getGraderInfo);


/*UPDATE GRADER WEIGHT, CAPS, OFFSET*/
router.post('/update-grader-info', controllers.ProfessorDashboardController.updateGraderInfo);


/*REQUESTS TO CANVAS API */
router.post('/canvas-api', controllers.CanvasAPIController.GET_all);


/*SYNC APP DATA WITH CANVAS*/
router.get('/sync-with-canvas/:type', controllers.SyncWithCanvasController.syncWithCanvas);

/*GET ALL ASSIGMENTS */
router.get('/get-all-assignments', controllers.SubmissionsController.getAllAssignments);

/*DOWNLOAD SUBMISSIONS*/
router.post('/download-submission', controllers.DownloadController.downloadSubmissions);


/*DISTRIBUTION PIPELINE*/
router.post('/distribute', controllers.ProfessorDashboardController.runDisturbation);


/*GRADE PASS BACK*/
router.post('/upload-submission-grades/assignments/:assignment_id/submissions/batch-update-grades', controllers.GradingController.batchGrade);

/*USER ON BOARD */
router.post('/update-canvas-token', (controllers.OnboardController.addCanvasToken));

router.post('/update-course-id', (controllers.OnboardController.addCourseID));

router.get('/get-course-id', (controllers.OnboardController.getCourseId));

module.exports = router;
