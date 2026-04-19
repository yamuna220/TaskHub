const db = require('../config/database');
const { randomUUID: uuidv4 } = require('crypto');

exports.createInvitation = async (req, res) => {
  const { email, role } = req.body;
  const organizationId = req.organizationId;
  const token = uuidv4();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  try {
    const result = await db.query(
      'INSERT INTO invitations (organization_id, email, role, token, expires_at) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [organizationId, email, role || 'member', token, expiresAt]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create invitation' });
  }
};

exports.getInvitation = async (req, res) => {
  const { token } = req.params;

  try {
    const result = await db.query(
      `SELECT i.*, o.name as organization_name 
       FROM invitations i 
       JOIN organizations o ON i.organization_id = o.id 
       WHERE i.token = $1 AND i.is_accepted = FALSE AND i.expires_at > CURRENT_TIMESTAMP`,
      [token]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Invitation not found or expired' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
