const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const tenantMiddleware = require('../middleware/tenantMiddleware');
const { requirePermission } = require('../middleware/rbacMiddleware');

router.use(authMiddleware);
router.use(tenantMiddleware);

router.get('/', requirePermission('view_all_users'), userController.getUsers);
router.get('/:id', userController.getUserById);
router.put('/:id/role', requirePermission('manage_roles'), userController.updateUserRole);

module.exports = router;
