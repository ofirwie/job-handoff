-- Realistic Handover System Database Schema
-- Based on the practical specification, not fantasy "auto-detection"

-- Users table - basic employee information
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    department VARCHAR(255),
    manager_id INTEGER REFERENCES users(id),
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Templates table - predefined handover templates by role
CREATE TABLE templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    target_role VARCHAR(255) NOT NULL,
    sections JSONB NOT NULL, -- Form fields and structure
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- Handovers table - main handover records
CREATE TABLE handovers (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER REFERENCES users(id) NOT NULL,
    manager_id INTEGER REFERENCES users(id) NOT NULL,
    template_id INTEGER REFERENCES templates(id) NOT NULL,
    status VARCHAR(50) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'pending_review', 'approved', 'rejected', 'stale')),
    form_data JSONB DEFAULT '{}', -- User's form responses
    file_paths JSONB DEFAULT '{}', -- SharePoint/server file paths
    progress_percentage INTEGER DEFAULT 0,
    rejection_reason TEXT,
    manager_notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP, -- When user submitted for review
    approved_at TIMESTAMP,  -- When manager approved
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Handover tasks table - specific tasks for each handover
CREATE TABLE handover_tasks (
    id SERIAL PRIMARY KEY,
    handover_id INTEGER REFERENCES handovers(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    is_required BOOLEAN DEFAULT false,
    is_completed BOOLEAN DEFAULT false,
    file_path VARCHAR(500), -- Path to file in SharePoint/server
    notes TEXT,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Audit log table - track all actions for compliance
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(100) NOT NULL, -- 'create', 'update', 'approve', 'reject', 'view'
    resource_type VARCHAR(50) NOT NULL, -- 'handover', 'template', 'task'
    resource_id INTEGER NOT NULL,
    details JSONB,
    ip_address INET,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Notifications table - email and in-app notifications
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    type VARCHAR(100) NOT NULL, -- 'handover_submitted', 'approval_needed', 'handover_approved'
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    handover_id INTEGER REFERENCES handovers(id),
    is_read BOOLEAN DEFAULT false,
    sent_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_manager ON users(manager_id);
CREATE INDEX idx_templates_role ON templates(target_role, is_active);
CREATE INDEX idx_handovers_employee ON handovers(employee_id);
CREATE INDEX idx_handovers_manager ON handovers(manager_id);
CREATE INDEX idx_handovers_status ON handovers(status);
CREATE INDEX idx_handovers_manager_status ON handovers(manager_id, status);
CREATE INDEX idx_handover_tasks_handover ON handover_tasks(handover_id);
CREATE INDEX idx_handover_tasks_completed ON handover_tasks(handover_id, is_completed);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id, created_at);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = false;

-- Sample data for testing
INSERT INTO users (email, name, role, department, password_hash) VALUES
('admin@company.com', 'System Admin', 'Admin', 'IT', '$2b$10$example_hash'),
('mike.manager@company.com', 'Mike Johnson', 'Engineering Manager', 'Engineering', '$2b$10$example_hash'),
('sarah.employee@company.com', 'Sarah Williams', 'HR Specialist', 'Human Resources', '$2b$10$example_hash'),
('john.dev@company.com', 'John Smith', 'Senior Developer', 'Engineering', '$2b$10$example_hash');

-- Update manager relationships
UPDATE users SET manager_id = 2 WHERE email = 'sarah.employee@company.com';
UPDATE users SET manager_id = 2 WHERE email = 'john.dev@company.com';

-- Sample template for HR Specialist role
INSERT INTO templates (name, target_role, sections, created_by) VALUES (
'HR Specialist Handover Template',
'HR Specialist',
'{
  "basic_info": {
    "title": "Basic Information",
    "fields": [
      {"name": "last_work_day", "type": "date", "label": "Last Work Day", "required": true},
      {"name": "replacement_contact", "type": "text", "label": "Replacement Contact", "required": false, "placeholder": "Name and email of replacement"},
      {"name": "emergency_contact", "type": "text", "label": "Emergency Contact During Transition", "required": true}
    ]
  },
  "files_locations": {
    "title": "File Locations",
    "fields": [
      {"name": "hr_files_path", "type": "text", "label": "HR Files Location", "placeholder": "\\\\server\\hr\\folder", "required": true},
      {"name": "employee_files_path", "type": "text", "label": "Employee Records Path", "placeholder": "SharePoint URL", "required": true},
      {"name": "policies_path", "type": "text", "label": "Policies and Procedures", "placeholder": "Document library path", "required": false}
    ]
  },
  "contacts": {
    "title": "Key Contacts",
    "fields": [
      {"name": "payroll_contact", "type": "text", "label": "Payroll Contact", "required": true},
      {"name": "benefits_contact", "type": "text", "label": "Benefits Administrator", "required": true},
      {"name": "legal_contact", "type": "text", "label": "Legal Department Contact", "required": false}
    ]
  },
  "tasks": [
    {"description": "Upload employee contact list to SharePoint", "required": true},
    {"description": "Document current HR processes and procedures", "required": true},
    {"description": "Transfer benefits administration access", "required": true},
    {"description": "Update payroll system contacts", "required": true},
    {"description": "Create handover document for ongoing projects", "required": false},
    {"description": "Schedule transition meeting with replacement", "required": false}
  ]
}',
1
);

-- Sample template for Senior Developer role  
INSERT INTO templates (name, target_role, sections, created_by) VALUES (
'Senior Developer Handover Template',
'Senior Developer', 
'{
  "basic_info": {
    "title": "Basic Information",
    "fields": [
      {"name": "last_work_day", "type": "date", "label": "Last Work Day", "required": true},
      {"name": "code_review_handover", "type": "text", "label": "Code Review Responsibilities", "required": true},
      {"name": "on_call_schedule", "type": "text", "label": "On-Call Schedule Notes", "required": false}
    ]
  },
  "technical_info": {
    "title": "Technical Information", 
    "fields": [
      {"name": "github_repos", "type": "textarea", "label": "GitHub Repositories List", "required": true, "placeholder": "List main repos you work on"},
      {"name": "deployment_access", "type": "textarea", "label": "Deployment and Server Access", "required": true},
      {"name": "api_keys_location", "type": "text", "label": "API Keys and Secrets Location", "required": true, "placeholder": "Path to secure storage"}
    ]
  },
  "documentation": {
    "title": "Documentation",
    "fields": [
      {"name": "architecture_docs", "type": "text", "label": "Architecture Documentation Path", "required": true},
      {"name": "runbooks_location", "type": "text", "label": "Runbooks and Procedures", "required": true}
    ]
  },
  "tasks": [
    {"description": "Document current projects and their status", "required": true},
    {"description": "Update code documentation and README files", "required": true},
    {"description": "Transfer deployment access to team lead", "required": true},
    {"description": "Create technical handover document", "required": true},
    {"description": "Update team wiki with current responsibilities", "required": false},
    {"description": "Schedule knowledge transfer session", "required": false}
  ]
}',
1
);