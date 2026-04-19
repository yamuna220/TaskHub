const db = require('../config/database');

exports.getUsers = async (req, res) => {
  const organizationId = req.organizationId;
  try {
    const result = await db.query(
      `SELECT u.id, u.email, u.first_name, u.last_name, u.role, u.is_active,
       (SELECT COUNT(*) FROM tasks WHERE assigned_to = u.id AND status != 'completed') as active_task_count
       FROM users u WHERE u.organization_id = $1`,
      [organizationId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getUserById = async (req, res) => {
  const { id } = req.params;
  const organizationId = req.organizationId;
  try {
    const result = await db.query(
      'SELECT id, email, first_name, last_name, role, is_active FROM users WHERE id = $1 AND organization_id = $2',
      [id, organizationId]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  const organizationId = req.organizationId;

  if (!['admin', 'member', 'viewer'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }

  try {
    const result = await db.query(
      'UPDATE users SET role = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND organization_id = $3 RETURNING id, email, role',
      [role, id, organizationId]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
