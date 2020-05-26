var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const grader = require('../models/Grader');
const pool = require('../pool');

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(async function (id, done) {
    let promisePool = pool.promise();
    const [rows, fileds] = await promisePool.query('SELECT id, name, role from grader WHERE id=?', [id]);
    done(null, rows[0]);
});


passport.use(new GoogleStrategy({
    clientID: process.env.clientID,
    clientSecret: process.env.clientSecret,
    callbackURL: process.env.callbackURL
},
async function (token, tokenSecret, profile, done) {
    try {
        let user = await grader.userWithEmailExists(profile._json.email);

        if (user == []) {
            return done(null, false, { message: 'You are not listed are a listed grader. You are, please contact that course admin.' });
        }
        return done(null, user);
    } catch (error) {
        return done(null, false, { message: 'Something went wrong, please try again later' });
    }
}
));