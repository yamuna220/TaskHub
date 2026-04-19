-- Organizations Table
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users Table (with tenant isolation)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(50) NOT NULL DEFAULT 'member', -- admin, member, viewer
    oauth_provider VARCHAR(50), -- google, facebook, etc
    oauth_id VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(organization_id, email),
    UNIQUE(oauth_provider, oauth_id)
);

-- Tasks Table (with tenant isolation)
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, in_progress, completed
    priority VARCHAR(50) DEFAULT 'medium', -- low, medium, high
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    created_by UUID NOT NULL REFERENCES users(id),
    due_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit Log Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    action VARCHAR(100) NOT NULL, -- CREATE, UPDATE, DELETE
    entity_type VARCHAR(100), -- task, user, organization
    entity_id UUID,
    changes JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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
