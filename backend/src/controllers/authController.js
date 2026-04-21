const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomUUID: uuidv4 } = require('crypto');
const Joi = require('joi');
const db = require('../config/database');
const emailService = require('../services/emailService');
require('dotenv').config();

// Validation Schemas
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).regex(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/).required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().optional(),
  organizationName: Joi.string().optional(),
  organizationDescription: Joi.string().allow('', null).optional(),
  role: Joi.string().valid('admin', 'member', 'viewer').optional(),
  inviteToken: Joi.string().allow('', null).optional()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  role: Joi.string().valid('admin', 'member', 'viewer').optional()
});

exports.register = async (req, res) => {
  const { error } = registerSchema.validate(req.body);
  if (error) return res.status(400).json({ 
    error: error.details[0].message.includes('password') 
      ? 'Password must be 8+ chars with uppercase, number, and special character.' 
      : error.details[0].message 
  });

  const { email, password, firstName, lastName, organizationName, organizationDescription, role, inviteToken } = req.body;

  try {
    const existingUser = await db.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existingUser.rowCount > 0) return res.status(400).json({ error: 'Email already registered' });

    const passwordHash = await bcryptjs.hash(password, 10);
    const userId = uuidv4();
    const verificationToken = uuidv4();
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await db.query('BEGIN');

    let orgId;
    let finalRole = role || 'admin';

    if (inviteToken) {
      const inviteResult = await db.query(
        'SELECT organization_id, role FROM invitations WHERE token = $1 AND is_accepted = FALSE AND expires_at > CURRENT_TIMESTAMP',
        [inviteToken]
      );

      if (inviteResult.rowCount === 0) {
        await db.query('ROLLBACK');
        return res.status(400).json({ error: 'Invalid or expired invitation' });
      }

      orgId = inviteResult.rows[0].organization_id;
      finalRole = inviteResult.rows[0].role;

      // Mark invite as used
      await db.query('UPDATE invitations SET is_accepted = TRUE WHERE token = $1', [inviteToken]);
    } else {
      // Create new org for the admin
      orgId = uuidv4();
      await db.query('INSERT INTO organizations (id, name, description) VALUES ($1, $2, $3)', [orgId, organizationName || `${firstName}'s Workspace`, organizationDescription]);
    }

    // Create user (Auto-verify for local dev/demo)
    await db.query(
      `INSERT INTO users (id, organization_id, email, password_hash, first_name, last_name, role, is_verified, is_active, verification_token, verification_token_expiry) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE, TRUE, $8, $9)`,
      [userId, orgId, email.toLowerCase(), passwordHash, firstName, lastName, finalRole, verificationToken, tokenExpiry]
    );

    await db.query('COMMIT');

    res.status(201).json({
      message: 'Account Created Successfully!',
      verificationToken
    });
  } catch (err) {
    try { await db.query('ROLLBACK'); } catch(e) {}
    console.error(err);
    res.status(500).json({ error: 'Registration failed: ' + err.message });
  }
};

exports.verifyEmail = async (req, res) => {
  const { token } = req.body;
  const { token: tokenQuery } = req.query; // Fallback for GET request redirects
  const finalToken = token || tokenQuery;

  if (!finalToken) return res.status(400).json({ error: 'Token is required' });

  try {
    const result = await db.query(
      `SELECT id, email, first_name, role FROM users 
       WHERE verification_token = $1 AND verification_token_expiry > CURRENT_TIMESTAMP AND is_verified = FALSE`,
      [finalToken]
    );

    if (result.rowCount === 0) return res.status(400).json({ error: 'Invalid or expired token' });

    const user = result.rows[0];
    await db.query(
      'UPDATE users SET is_verified = TRUE, verification_token = NULL, verification_token_expiry = NULL WHERE id = $1',
      [user.id]
    );

    await emailService.sendWelcomeEmail(user.email, user.first_name, user.role);

    res.json({ message: 'Email verified successfully!' });
  } catch (err) {
    res.status(500).json({ error: 'Verification failed' });
  }
};

// GET version for browser links
exports.verifyEmailGet = async (req, res) => {
    const { token } = req.query;
    try {
        const result = await db.query('SELECT id, email, first_name, role FROM users WHERE verification_token = $1 AND is_verified = FALSE', [token]);
        if (result.rowCount === 0) return res.send('<h1>Invalid or Expired Token</h1>');
        
        const user = result.rows[0];
        await db.query('UPDATE users SET is_verified = TRUE, verification_token = NULL WHERE id = $1', [user.id]);
        await emailService.sendWelcomeEmail(user.email, user.first_name, user.role);
        
        res.send('<h1>Email Verified Successfully!</h1><p>You can now go back and log in.</p><a href="http://localhost:3000">Go to Tasks</a>');
    } catch (err) {
        res.status(500).send('Verification failed');
    }
};

exports.login = async (req, res) => {
  const { error } = loginSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const { email, password, role: roleOverride } = req.body;
  const ipAddress = req.ip;
  const userAgent = req.headers['user-agent'];

  try {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
    if (result.rowCount === 0) return res.status(401).json({ error: 'Invalid credentials' });

    const user = result.rows[0];
    
    if (!user.is_verified) return res.status(401).json({ error: 'Please verify your email first' });
    if (!user.is_active) return res.status(403).json({ error: 'Account deactivated' });

    const isMatch = await bcryptjs.compare(password, user.password_hash);
    if (!isMatch) {
      try {
        await db.query('INSERT INTO login_history (id, user_id, ip_address, user_agent, success, failure_reason) VALUES ($1, $2, $3, $4, FALSE, $5)',
          [uuidv4(), user.id, ipAddress, userAgent, 'Invalid password']);
      } catch (e) { console.error('History log failed', e); }
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const payload = { id: user.id, email: user.email, role: user.role, organization_id: user.organization_id };
    const jwtSecret = (process.env.JWT_SECRET || 'taskhub_fallback_secret').trim();
    const jwtExpiry = (process.env.JWT_EXPIRY || '1h').trim();
    const jwtRefreshSecret = (process.env.JWT_REFRESH_SECRET || 'taskhub_refresh_fallback').trim();
    const jwtRefreshExpiry = (process.env.JWT_REFRESH_EXPIRY || '7d').trim();
    const token = jwt.sign(payload, jwtSecret, { expiresIn: jwtExpiry });
    const refreshToken = jwt.sign({ id: user.id }, jwtRefreshSecret, { expiresIn: jwtRefreshExpiry });

    // Update login stats
    await db.query('UPDATE users SET last_login = CURRENT_TIMESTAMP, login_count = login_count + 1 WHERE id = $1', [user.id]);
    try {
      await db.query('INSERT INTO login_history (id, user_id, ip_address, user_agent, success) VALUES ($1, $2, $3, $4, TRUE)',
          [uuidv4(), user.id, ipAddress, userAgent]);
    } catch (e) { console.error('History log failed', e); }

    res.json({
      token,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        organizationId: user.organization_id
      }
    });
  } catch (err) {
    console.error('LOGIN ERROR:', err.message, err.stack);
    res.status(500).json({ error: 'Login failed: ' + err.message });
  }
};

exports.refreshToken = async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ error: 'Refresh token required' });

    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const result = await db.query('SELECT * FROM users WHERE id = $1 AND is_active = TRUE', [decoded.id]);
        if (result.rowCount === 0) return res.status(401).json({ error: 'User not found' });

        const user = result.rows[0];
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role, organization_id: user.organization_id }, 
            process.env.JWT_SECRET, 
            { expiresIn: process.env.JWT_EXPIRY }
        );
        res.json({ token });
    } catch (err) {
        res.status(401).json({ error: 'Invalid refresh token' });
    }
};

exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const result = await db.query('SELECT id, first_name FROM users WHERE email = $1', [email.toLowerCase()]);
        if (result.rowCount > 0) {
            const token = uuidv4();
            const expiry = new Date(Date.now() + 3600000); // 1 hour
            await db.query('UPDATE users SET password_reset_token = $1, password_reset_token_expiry = $2 WHERE id = $3', [token, expiry, result.rows[0].id]);
            await emailService.sendPasswordResetEmail(email, token, result.rows[0].first_name);
        }
        res.json({ message: 'If email exists, a reset link has been sent' });
    } catch (err) {
        res.status(500).json({ error: 'Request failed' });
    }
};

exports.resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;
    try {
        const result = await db.query('SELECT id FROM users WHERE password_reset_token = $1 AND password_reset_token_expiry > CURRENT_TIMESTAMP', [token]);
        if (result.rowCount === 0) return res.status(400).json({ error: 'Invalid or expired token' });
        
        const hash = await bcryptjs.hash(newPassword, 10);
        await db.query('UPDATE users SET password_hash = $1, password_reset_token = NULL, password_reset_token_expiry = NULL WHERE id = $2', [hash, result.rows[0].id]);
        res.json({ message: 'Password reset successful' });
    } catch (err) {
        res.status(500).json({ error: 'Reset failed' });
    }
};

exports.getCurrentUser = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, organization_id, email, first_name, last_name, role FROM users WHERE id = $1',
      [req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.logout = async (req, res) => {
    // Logic for token blacklisting or just client-side deletion
    res.json({ message: 'Logged out' });
};
