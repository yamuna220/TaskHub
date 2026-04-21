const db = require('../config/database');

class PermissionService {
  /**
   * Check if user has a specific permission
   */
  async hasPermission(userId, permission) {
    try {
      // First check if user is admin - admins have all permissions
      const userResult = await db.query('SELECT role FROM users WHERE id = $1', [userId]);
      if (userResult.rowCount > 0 && userResult.rows[0].role === 'admin') {
        return true;
      }

      const result = await db.query(
        `SELECT rp.permission FROM role_permissions rp
         INNER JOIN users u ON u.role = rp.role
         WHERE u.id = $1 AND rp.permission = $2`,
        [userId, permission]
      );
      return result.rowCount > 0;
    } catch (error) {
      console.error('Permission check error:', error);
      return false;
    }
  }

  /**
   * Get all permissions for a user
   */
  async getUserPermissions(userId) {
    try {
      const result = await db.query(
        `SELECT rp.permission FROM role_permissions rp
         INNER JOIN users u ON u.role = rp.role
         WHERE u.id = $1`,
        [userId]
      );
      return result.rows.map(row => row.permission);
    } catch (error) {
      console.error('Error fetching permissions:', error);
      return [];
    }
  }

  /**
   * Check if user can perform action on a specific task
   */
  async canPerformTaskAction(userId, taskId, action) {
    try {
      const userResult = await db.query('SELECT role FROM users WHERE id = $1', [userId]);
      if (userResult.rowCount === 0) return false;
      const userRole = userResult.rows[0].role;

      if (userRole === 'admin') return true;

      const taskResult = await db.query('SELECT created_by, assigned_to FROM tasks WHERE id = $1', [taskId]);
      if (taskResult.rowCount === 0) return false;
      const { created_by, assigned_to } = taskResult.rows[0];

      switch (action) {
        case 'view':
          return assigned_to === userId || created_by === userId;
        case 'edit':
        case 'delete':
          return userRole === 'member' && created_by === userId;
        default:
          return false;
      }
    } catch (error) {
      console.error('Task permission check error:', error);
      return false;
    }
  }
}

module.exports = new PermissionService();
