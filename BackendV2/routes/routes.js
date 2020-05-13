var express = require('express');
var router = express.Router();
var controllers = require('../controllers/');
var passport = require('passport');



/* GET LOGGED IN USER */
router.get('/user', function (req, res, next) {
    res.status(200).json({
        user: req.user,
        authenticated: true,
        message: "user has been authenticated"
    });
});


/* DELETE all entires of all tables in the DB. */
router.get('/delete-data-base', controllers.DataBaseController.deleteDB);


/* GET course number. */
router.get('/get-course-number', controllers.CanvasController.getCourseNumber);


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
router.get('/sync-with-canvas', controllers.SyncWithCanvasController.syncWithCanvas)

/*GET ALL ASSIGMENTS */
router.get('/get-all-assignments', controllers.SubmissionsController.getAllAssignments)

/*DOWNLOAD SUBMISSIONS*/
router.post('/download-submission', controllers.DownloadController.downloadSubmissions)


/*DISTRIBUTION PIPELINE*/
router.post('/distribute', controllers.ProfessorDashboardController.runDisturbation);


/*GRADE PASS BACK*/
router.post('/upload-submission-grades/assignments/:assignment_id/submissions/batch-update-grades', controllers.GradingController.batchGrade);


router.post('/update-canvas-token', (controllers.OnboardController.addCanvasToken));


module.exports = router;
