var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const grader = require('../models/Grader');
const pool = require('../pool')

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(async function (id, done) {
  let promisePool = pool.promise();
  const [rows, fileds] = await promisePool.query('SELECT id, name, role from grader WHERE id=?', [id]);
  done(null, rows[0]);
});


passport.use(new GoogleStrategy({
  clientID: "473561915095-dh41n0felpi6k9kgggneteej58q52igh.apps.googleusercontent.com",
  clientSecret: "SSrFtQyIEuAyzo97tv1I97ER",
  callbackURL: "http://localhost:5000/auth/google/callback"
},
  async function (token, tokenSecret, profile, done) {
    try {
      let user = await grader.userWithEmailExists(profile._json.email);

      if (user == []) {
        return done(null, new Error("Grader not found"), { message: 'You are not listed are a listed grader. You are, please contact that course admin.' });
      }
      return done(null, user);
    } catch (error) {
      return done(null, error, { message: 'Something went wrong, please try again later' });
    }
  }
));