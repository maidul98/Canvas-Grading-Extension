var express = require('express');
var router = express.Router();
var controllers = require('../controllers/');
var passport = require('passport');

router.get('/google', passport.authenticate('google', {scope: ['email', 'profile'] }));

router.get('/google/callback', 
  passport.authenticate('google', {failureRedirect:'auth/login-failed', scope: ['email', 'profile']}),
  function(req, res) {
    res.redirect('http://localhost:3000/assignments');
});

router.get('/login-failed', (req,res)=>{
    res.status(401).json({
        success: false,
        message: "You are not a listed grader."
    });
});


// When logout, redirect to client
router.get("/logout",  (req, res) => {
    req.logout();
    return res.redirect("http://localhost:3000?message=you have been logged out");
});

module.exports = router;