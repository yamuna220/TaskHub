const db = require('../config/database');

exports.getAuditLogs = async (req, res) => {
  const organizationId = req.organizationId;
  const { action, entity_type, entity_id, user_id } = req.query;

  let query = 'SELECT * FROM audit_logs WHERE organization_id = $1';
  let params = [organizationId];

  if (action) {
    query += ' AND action = $' + (params.length + 1);
    params.push(action);
  }
  if (entity_type) {
    query += ' AND entity_type = $' + (params.length + 1);
    params.push(entity_type);
  }
  if (entity_id) {
    query += ' AND entity_id = $' + (params.length + 1);
    params.push(entity_id);
  }
  if (user_id) {
    query += ' AND user_id = $' + (params.length + 1);
    params.push(user_id);
  }

  query += ' ORDER BY timestamp DESC LIMIT 100';

  try {
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getAuditStats = async (req, res) => {
  const organizationId = req.organizationId;
  try {
    // 1. Total Events
    const totalResult = await db.query('SELECT COUNT(*) as count FROM audit_logs WHERE organization_id = $1', [organizationId]);
    
    // 2. Security Flags (e.g., FAILED_LOGIN or DELETE actions)
    const securityResult = await db.query(
      "SELECT COUNT(*) as count FROM audit_logs WHERE organization_id = $1 AND (action = 'FAILED_LOGIN' OR action = 'DELETE')",
      [organizationId]
    );

    // 3. Retention (Since first log)
    const retentionResult = await db.query(
      'SELECT MIN(timestamp) as first_log FROM audit_logs WHERE organization_id = $1',
      [organizationId]
    );
    
    const firstLog = retentionResult.rows[0].first_log;
    let retentionDays = 0;
    if (firstLog) {
      const diffTime = Math.abs(new Date() - new Date(firstLog));
      retentionDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    res.json({
      totalEvents: totalResult.rows[0].count,
      securityFlags: securityResult.rows[0].count,
      retentionDays: retentionDays || 1
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
