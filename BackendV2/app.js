require('dotenv').config()
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var logger = require('morgan');
var indexRouter = require('./routes/routes');
var authRoutes = require('./routes/authRoutes');

const passportSetup = require('./config/passport-setup');
var passport = require('passport');
var cookieParser = require('cookie-parser');
const cookieSession = require("cookie-session");
var cors = require('cors')
var app = express();
app.set('view engine', 'jade');
app.use(
  cookieSession({
    keys: ['1111111'],
    name: "session",
    maxAge: 24 * 60 * 60 * 100
  })
);

// parse cookies
app.use(cookieParser());

// initalize passport
app.use(passport.initialize());
// deserialize cookie from the browser
app.use(passport.session());

// set up cors to allow us to accept requests from our client
app.use(
  cors({
    origin: "http://localhost:3000", // allow to server to accept request from different origin
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true // allow session cookie from browser to pass through
  })
);

app.use(logger('dev'));
app.use(express.json());
// app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

app.use('/auth', authRoutes);
//Check if the user is logged in
const authCheck = (req, res, next) => {
  if (!req.user) {
      res.status(401).json({
        authenticated: false,
        message: "user has not been authenticated"
      });
    } else {
  next();
  }
};


app.use('/', authCheck, indexRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// Handle errors
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
