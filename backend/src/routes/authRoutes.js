const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const rateLimit = require('express-rate-limit');

const passport = require('passport');

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 10,
  message: { error: 'Too many auth attempts. Please try again after 15 minutes.' }
});



router.post('/register', authLimiter, authController.register);
router.post('/login', authLimiter, authController.login);
router.post('/verify-email', authController.verifyEmail);
router.get('/verify-email-get', authController.verifyEmailGet);
router.post('/refresh', authController.refreshToken);
router.post('/forgot-password', authLimiter, authController.forgotPassword);
router.post('/reset-password', authLimiter, authController.resetPassword);

router.get('/me', authMiddleware, authController.getCurrentUser);
router.post('/logout', authMiddleware, authController.logout);

module.exports = router;
