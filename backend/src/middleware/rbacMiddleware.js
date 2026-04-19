const permissionService = require('../services/permissionService');

/**
 * Middleware: Check if user has specific permission
 */
const requirePermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const hasPermission = await permissionService.hasPermission(req.user.id, requiredPermission);

      if (!hasPermission) {
        return res.status(403).json({ error: `Permission denied: ${requiredPermission} required.` });
      }

      next();
    } catch (error) {
      console.error('RBAC Error:', error);
      res.status(500).json({ error: 'Internal server error during permission check.' });
    }
  };
};

/**
 * Middleware: Check if user can perform action on a task
 */
const canEditTask = () => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.id) return res.status(401).json({ error: 'Unauthorized' });
      
      const taskId = req.params.id;
      const canEdit = await permissionService.canPerformTaskAction(req.user.id, taskId, 'edit');

      if (!canEdit) {
        return res.status(403).json({ error: 'You do not have permission to edit this task.' });
      }
      next();
    } catch (error) {
      console.error('RBAC Task Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
};

module.exports = {
  requirePermission,
  canEditTask
};
