const express = require('express');
const router = express.Router();
const invitationController = require('../controllers/invitationController');
const authMiddleware = require('../middleware/authMiddleware');
const tenantMiddleware = require('../middleware/tenantMiddleware');
const { requirePermission } = require('../middleware/rbacMiddleware');

// Public route to check invite details
router.get('/:token', invitationController.getInvitation);

// Secured routes to create invite
router.use(authMiddleware);
router.use(tenantMiddleware);
router.post('/', requirePermission('manage_users'), invitationController.createInvitation);

module.exports = router;
