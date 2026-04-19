const db = require('./database');

const initDb = async () => {
  try {
    console.log('🏗️ Initializing PostgreSQL Database...');

    await db.query(`
      CREATE TABLE IF NOT EXISTS organizations (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        organization_id VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        password_hash TEXT,
        first_name VARCHAR(255),
        last_name VARCHAR(255),
        role VARCHAR(50) NOT NULL DEFAULT 'member',
        oauth_provider VARCHAR(50),
        oauth_id VARCHAR(255),
        is_active BOOLEAN DEFAULT TRUE,
        is_verified BOOLEAN DEFAULT FALSE,
        verification_token TEXT,
        verification_token_expiry TIMESTAMP,
        password_reset_token TEXT,
        password_reset_token_expiry TIMESTAMP,
        last_login TIMESTAMP,
        login_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(organization_id, email),
        FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
      )
    `);

    // Create Login History Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS login_history (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        ip_address VARCHAR(255),
        user_agent TEXT,
        login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        logout_time TIMESTAMP,
        success BOOLEAN DEFAULT TRUE,
        failure_reason TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create Indexes
    await db.query(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
    await db.query(`CREATE INDEX IF NOT EXISTS idx_users_org_id ON users(organization_id)`);
    await db.query(`CREATE INDEX IF NOT EXISTS idx_login_history_user_id ON login_history(user_id)`);

    await db.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id VARCHAR(255) PRIMARY KEY,
        organization_id VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        priority VARCHAR(50) DEFAULT 'medium',
        assigned_to VARCHAR(255),
        created_by VARCHAR(255) NOT NULL,
        due_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
        FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (created_by) REFERENCES users(id)
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id VARCHAR(255) PRIMARY KEY,
        organization_id VARCHAR(255) NOT NULL,
        user_id VARCHAR(255) NOT NULL,
        action VARCHAR(255) NOT NULL,
        entity_type VARCHAR(255),
        entity_id VARCHAR(255),
        changes TEXT,
        ip_address VARCHAR(255),
        user_agent TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS role_permissions (
        id SERIAL PRIMARY KEY,
        role VARCHAR(50) NOT NULL,
        permission VARCHAR(255) NOT NULL,
        UNIQUE(role, permission)
      )
    `);

    // Insert Full Permission Matrix
    const permissions = [
      // ADMIN Permissions (Full Access)
      ['admin', 'view_all_tasks'], ['admin', 'create_task'], ['admin', 'edit_all_tasks'], ['admin', 'delete_all_tasks'],
      ['admin', 'view_all_users'], ['admin', 'create_user'], ['admin', 'edit_all_users'], ['admin', 'delete_user'],
      ['admin', 'manage_roles'], ['admin', 'view_audit_logs'], ['admin', 'export_audit_logs'], ['admin', 'delete_audit_logs'],
      ['admin', 'manage_organization'], ['admin', 'assign_task'], ['admin', 'change_task_status'],

      // MEMBER Permissions (Limited Access)
      ['member', 'view_own_tasks'], ['member', 'create_task'], ['member', 'edit_own_tasks'], ['member', 'delete_own_tasks'],
      ['member', 'view_own_profile'], ['member', 'edit_own_profile'], ['member', 'view_team_members'],
      ['member', 'view_audit_logs'], ['member', 'export_audit_logs'], ['member', 'change_task_status'],

      // VIEWER Permissions (Read Only)
      ['viewer', 'view_own_tasks'], ['viewer', 'view_own_profile'], ['viewer', 'view_audit_logs']
    ];

    for (const [role, permission] of permissions) {
      await db.query('INSERT INTO role_permissions (role, permission) VALUES ($1, $2) ON CONFLICT (role, permission) DO NOTHING', [role, permission]);
    }

    console.log('✅ PostgreSQL Database Initialized.');
  } catch (err) {
    console.error('❌ Error initializing database:', err);
  }
};

module.exports = initDb;
if (require.main === module) {
  initDb();
}
