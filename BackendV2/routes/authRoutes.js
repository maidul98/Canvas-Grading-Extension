var express = require('express');
var router = express.Router();
var controllers = require('../controllers/');
var passport = require('passport');

router.get('/google', passport.authenticate('google', {scope: ['email', 'profile'] }));

router.get('/google/callback', 
  passport.authenticate('google', {failureRedirect:'/auth/login-failed', scope: ['email', 'profile']}),
  function(req, res) {
    res.redirect('http://localhost:3000/assignments');
});

router.get('/login-failed', (req,res)=>{
    res.redirect('http://localhost:3000/?message=You are not listed are a listed grader. You are, please contact that course admin.');
});


// When logout, redirect to client
router.get("/logout",  (req, res) => {
    req.logout();
    return res.redirect("http://localhost:3000?message=You have been logged out");
});

module.exports = router;