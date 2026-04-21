const pool = require('./src/config/database');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

async function createTest() {
  try {
    const hash = await bcrypt.hash('Password123!@#', 10);
    const orgId = uuidv4();
    const userId = uuidv4();
    await pool.query('INSERT INTO organizations (id, name) VALUES ($1, $2)', [orgId, 'Test Workspace']);
    await pool.query('INSERT INTO users (id, organization_id, email, password_hash, first_name, last_name, role, is_verified, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)', 
      [userId, orgId, 'test_admin@example.com', hash, 'Admin', 'User', 'admin', true, true]);
    console.log('User created');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
createTest();
