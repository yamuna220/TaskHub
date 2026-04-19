const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');
const authMiddleware = require('../middleware/authMiddleware');
const tenantMiddleware = require('../middleware/tenantMiddleware');
const { requirePermission } = require('../middleware/rbacMiddleware');

router.use(authMiddleware);
router.use(tenantMiddleware);

router.get('/logs', requirePermission('view_audit_logs'), auditController.getAuditLogs);
router.get('/stats', requirePermission('view_audit_logs'), auditController.getAuditStats);

module.exports = router;
