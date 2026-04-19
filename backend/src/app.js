const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const session = require('express-session');
const passport = require('./config/passport');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: (origin, callback) => callback(null, true),
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'taskhub_session_secret',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/auth', require('./routes/authRoutes'));
app.use('/tasks', require('./routes/taskRoutes'));
app.use('/users', require('./routes/userRoutes'));
app.use('/audit', require('./routes/auditRoutes'));
app.use('/invitations', require('./routes/invitationRoutes'));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('SERVER ERROR:', err.message, err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined, // Keep stack for dev
    details: err.toString()
  });
});

module.exports = app;
