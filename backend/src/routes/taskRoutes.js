const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const authMiddleware = require('../middleware/authMiddleware');
const tenantMiddleware = require('../middleware/tenantMiddleware');
const { requirePermission, canEditTask } = require('../middleware/rbacMiddleware');

router.use(authMiddleware);
router.use(tenantMiddleware);

router.post('/', requirePermission('create_task'), taskController.createTask);
router.get('/', taskController.getTasks);
router.get('/:id', taskController.getTaskById);
router.put('/:id', canEditTask(), taskController.updateTask);
router.delete('/:id', canEditTask(), taskController.deleteTask);
router.post('/:id/assign', requirePermission('assign_task'), taskController.assignTask);

module.exports = router;
