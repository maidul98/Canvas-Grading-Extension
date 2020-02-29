/**
 * This file will define all the routes needed for this project. Do not put any 
 * logic in this file - this is simply meant to define the endpoints we need to
 * set up and use. Put the relevant logic in api-call.js or queries.js
 * appropriately. 
 */
var express = require('express');
var router = express.Router();
var apiCalls = require('../controllers/api-calls')
var queries = require('../controllers/queries');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

/** Request for submissions */

/** Get all student enrollments */
router.get('/student-enrollments', apiCalls.student_enrollments);

//TODO: create database queries in another file
router.get('/datatest', queries.get_submission_table);
router.get('/assignments', queries.get_assignments_table);
/** Get assignment list */

module.exports = router;