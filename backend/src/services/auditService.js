const db = require('../config/database');
const { randomUUID: uuidv4 } = require('crypto');

class AuditService {
  /**
   * Log an action to the audit_logs table
   */
  async logAction(userId, action, entityType, entityId, changes, ipAddress, userAgent) {
    try {
      // Get organization_id for the user
      const userResult = await db.query('SELECT organization_id FROM users WHERE id = $1', [userId]);
      if (userResult.rowCount === 0) return;
      
      const orgId = userResult.rows[0].organization_id;
      const logId = uuidv4();

      await db.query(
        `INSERT INTO audit_logs (id, organization_id, user_id, action, entity_type, entity_id, changes, ip_address, user_agent)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          logId, 
          orgId, 
          userId, 
          action, 
          entityType || null, 
          entityId || null, 
          changes ? JSON.stringify(changes) : null, 
          ipAddress || null, 
          userAgent || null
        ]
      );
    } catch (error) {
      console.error('Audit logging error:', error);
    }
  }
}

module.exports = new AuditService();
