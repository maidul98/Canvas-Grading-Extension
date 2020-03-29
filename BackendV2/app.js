var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var logger = require('morgan');
var queries = require('./controllers/queries');
var indexRouter = require('./routes/routes');
//var usersRouter = require('./routes/users');
//Middleware
// var {canvasAPIRequest} = require('./middleware/middleware.js');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

app.use('/', indexRouter);

//app.use('/users', usersRouter);
//example use of getting grader objects
let a;
queries.get_grader_objects().then(result => {
    console.log(result)
    result[0].offset = 5;
    queries.update_grader_entries(result, function (err) {
        if (err) {
            console.log(err)
        }
    })
})
// queries.update_grader_entries(a, function (err) {
//     if (err) {
//         console.log(err)
//     }
// })
// catch 404 and forward to error handler
queries.get_grader_objects().then(result => console.log(result))

app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
