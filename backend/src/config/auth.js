const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const pool = require('./database');
require('dotenv').config();

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails[0].value;
      const oauthId = profile.id;

      // Find user by email or oauthId
      let res = await pool.query('SELECT * FROM users WHERE oauth_provider = $1 AND oauth_id = $2', ['google', oauthId]);
      
      if (res.rowCount === 0) {
        // Handle new user or link to existing email? 
        // For simplicity, we'll return an error if the user doesn't exist, 
        // or you could create a "default" organization for them.
        // In a real app, you'd probably redirect them to a "Finish Registration" page.
        return done(null, false, { message: 'OAuth user not found. Please register first.' });
      }

      return done(null, res.rows[0]);
    } catch (err) {
      return done(err);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const res = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    done(null, res.rows[0]);
  } catch (err) {
    done(err);
  }
});

module.exports = passport;
