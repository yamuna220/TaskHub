-- Organizations Table
CREATE TABLE IF NOT EXISTS organizations (
    id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Invitations Table
CREATE TABLE IF NOT EXISTS invitations (
    id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id VARCHAR(255) NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'member',
    token VARCHAR(255) NOT NULL UNIQUE,
    is_accepted BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users Table (with tenant isolation)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id VARCHAR(255) NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(50) NOT NULL DEFAULT 'member', -- admin, member, viewer
    oauth_provider VARCHAR(50), -- google, facebook, etc
    oauth_id VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    verification_token VARCHAR(255),
    verification_token_expiry TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(organization_id, email),
    UNIQUE(oauth_provider, oauth_id)
);

-- Tasks Table (with tenant isolation)
CREATE TABLE IF NOT EXISTS tasks (
    id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id VARCHAR(255) NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, in_progress, completed
    priority VARCHAR(50) DEFAULT 'medium', -- low, medium, high
    assigned_to VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
    created_by VARCHAR(255) NOT NULL REFERENCES users(id),
    due_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Comments Table
CREATE TABLE IF NOT EXISTS comments (
    id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id VARCHAR(255) NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Attachments Table
CREATE TABLE IF NOT EXISTS attachments (
    id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id VARCHAR(255) NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit Log Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id VARCHAR(255) NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL REFERENCES users(id),
    action VARCHAR(100) NOT NULL, -- CREATE, UPDATE, DELETE
    entity_type VARCHAR(100), -- task, user, organization
    entity_id VARCHAR(255),
    changes JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ensure defaults for existing tables
ALTER TABLE organizations ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE users ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE tasks ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE audit_logs ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE invitations ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE comments ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE attachments ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Permissions Table (for RBAC)
CREATE TABLE IF NOT EXISTS role_permissions (
    id SERIAL PRIMARY KEY,
    role VARCHAR(50) NOT NULL,
    permission VARCHAR(100) NOT NULL,
    UNIQUE(role, permission)
);

-- Insert Default Permissions
INSERT INTO role_permissions (role, permission) VALUES
('admin', 'view_all_tasks'),
('admin', 'create_task'),
('admin', 'edit_all_tasks'),
('admin', 'delete_task'),
('admin', 'manage_users'),
('admin', 'view_audit_log'),
('member', 'view_assigned_tasks'),
('member', 'create_task'),
('member', 'edit_own_tasks'),
('member', 'view_audit_log'),
('viewer', 'view_assigned_tasks'),
('viewer', 'view_audit_log')
ON CONFLICT (role, permission) DO NOTHING;

-- Insert Sample Organizations
INSERT INTO organizations (id, name, description) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'ACME Corp', 'Leading technology company'),
('550e8400-e29b-41d4-a716-446655440001', 'TechStart Inc', 'Innovative startup')
ON CONFLICT (name) DO NOTHING;

-- Insert Sample Users (Note: passwords are 'password123' hashed)
INSERT INTO users (organization_id, email, password_hash, first_name, last_name, role)
VALUES
('550e8400-e29b-41d4-a716-446655440000', 'alex@acme.com', '$2a$10$8K9V/D6P8y9y9y9y9y9y9O', 'Alex', 'Johnson', 'admin'),
('550e8400-e29b-41d4-a716-446655440000', 'sarah@acme.com', '$2a$10$8K9V/D6P8y9y9y9y9y9y9O', 'Sarah', 'Chen', 'member')
ON CONFLICT (organization_id, email) DO NOTHING;

-- Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_users_org_id ON users(organization_id);
CREATE INDEX IF NOT EXISTS idx_tasks_org_id ON tasks(organization_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_audit_logs_org_id ON audit_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);

-- Login History Table
CREATE TABLE IF NOT EXISTS login_history (
    id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ip_address VARCHAR(45),
    user_agent TEXT,
    success BOOLEAN NOT NULL,
    failure_reason TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_login_history_user_id ON login_history(user_id);
