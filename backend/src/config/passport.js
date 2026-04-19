const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { randomUUID: uuidv4 } = require('crypto');
const db = require('./database');
require('dotenv').config();

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || 'mock_client_id_for_startup',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'mock_client_secret',
    callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/auth/google/callback"
  },
  async function(accessToken, refreshToken, profile, done) {
    try {
      const email = profile.emails[0].value;
      const firstName = profile.name.givenName;
      const lastName = profile.name.familyName;
      
      // Check if user exists
      let result = await db.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
      let user;

      if (result.rowCount === 0) {
        // Create new user via Google
        const userId = uuidv4();
        const orgId = uuidv4(); // Create a new org for them
        
        await db.query('INSERT INTO organizations (id, name) VALUES ($1, $2)', [orgId, `${firstName}'s Workspace`]);
        
        await db.query(
          `INSERT INTO users (id, organization_id, email, first_name, last_name, role, is_verified, is_active) 
           VALUES ($1, $2, $3, $4, $5, $6, TRUE, TRUE)`,
          [userId, orgId, email.toLowerCase(), firstName, lastName, 'member']
        );
        
        result = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
      }
      
      user = result.rows[0];
      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    done(null, result.rows[0]);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
