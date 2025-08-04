-- Sample Data for Manager Dashboard Testing
-- Run this after applying the main schema and enhancements

-- Insert sample organization
INSERT INTO organizations (id, name, code, settings) VALUES 
('123e4567-e89b-12d3-a456-426614174000', 'OFIR AI Corp', 'OFIR', '{}')
ON CONFLICT (code) DO NOTHING;

-- Insert sample plants
INSERT INTO plants (id, organization_id, name, code, country, location, manager_email) VALUES 
('223e4567-e89b-12d3-a456-426614174000', '123e4567-e89b-12d3-a456-426614174000', 'Silicon Valley HQ', 'SV', 'USA', 'Palo Alto, CA', 'plant.manager@ofir.ai'),
('323e4567-e89b-12d3-a456-426614174000', '123e4567-e89b-12d3-a456-426614174000', 'Berlin Office', 'BER', 'Germany', 'Berlin, DE', 'berlin.manager@ofir.ai')
ON CONFLICT (organization_id, code) DO NOTHING;

-- Insert sample departments
INSERT INTO departments (id, plant_id, name, code, manager_email) VALUES 
('423e4567-e89b-12d3-a456-426614174000', '223e4567-e89b-12d3-a456-426614174000', 'Engineering', 'ENG', 'john.manager@ofir.ai'),
('523e4567-e89b-12d3-a456-426614174000', '223e4567-e89b-12d3-a456-426614174000', 'Product', 'PROD', 'sarah.manager@ofir.ai'),
('623e4567-e89b-12d3-a456-426614174000', '323e4567-e89b-12d3-a456-426614174000', 'Engineering', 'ENG-BER', 'hans.manager@ofir.ai')
ON CONFLICT (plant_id, code) DO NOTHING;

-- Insert sample jobs
INSERT INTO jobs (id, department_id, title, level, description) VALUES 
('723e4567-e89b-12d3-a456-426614174000', '423e4567-e89b-12d3-a456-426614174000', 'Senior Frontend Developer', 'senior', 'React and TypeScript development'),
('823e4567-e89b-12d3-a456-426614174000', '423e4567-e89b-12d3-a456-426614174000', 'Backend Engineer', 'senior', 'Node.js and database development'),
('923e4567-e89b-12d3-a456-426614174000', '523e4567-e89b-12d3-a456-426614174000', 'Product Manager', 'manager', 'Product strategy and roadmap'),
('a23e4567-e89b-12d3-a456-426614174000', '623e4567-e89b-12d3-a456-426614174000', 'DevOps Engineer', 'senior', 'Infrastructure and deployment')
ON CONFLICT DO NOTHING;

-- Insert sample categories
INSERT INTO categories (id, name, display_name, description, is_system_default) VALUES 
('b23e4567-e89b-12d3-a456-426614174000', 'access_handover', 'Access & Permissions', 'System access and permissions handover', true),
('c23e4567-e89b-12d3-a456-426614174000', 'project_handover', 'Project Documentation', 'Active projects and documentation', true),
('d23e4567-e89b-12d3-a456-426614174000', 'knowledge_transfer', 'Knowledge Transfer', 'Domain knowledge and best practices', true)
ON CONFLICT (name) DO NOTHING;

-- Insert sample item types
INSERT INTO item_types (id, name, description, fields_schema) VALUES 
('e23e4567-e89b-12d3-a456-426614174000', 'checklist_item', 'Simple checklist item', '{"type": "boolean", "label": "Completed"}'),
('f23e4567-e89b-12d3-a456-426614174000', 'document_upload', 'Document upload', '{"type": "file", "label": "Upload Document"}')
ON CONFLICT (name) DO NOTHING;

-- Insert sample base template
INSERT INTO base_templates (id, name, job_title, level, department, template_data, source) VALUES 
('123e4567-e89b-12d3-a456-426614174001', 'Senior Developer Handover', 'Senior Frontend Developer', 'senior', 'Engineering', 
'{"sections": [{"name": "Projects", "items": ["Document current projects", "Transfer code repositories"]}, {"name": "Access", "items": ["Review system access", "Transfer credentials"]}]}', 
'manual')
ON CONFLICT DO NOTHING;

-- Insert sample template
INSERT INTO templates (id, base_template_id, job_id, name, description, status) VALUES 
('223e4567-e89b-12d3-a456-426614174001', '123e4567-e89b-12d3-a456-426614174001', '723e4567-e89b-12d3-a456-426614174000', 
'Frontend Developer Handover Template', 'Standard handover for frontend developers', 'active')
ON CONFLICT DO NOTHING;

-- Insert sample template items
INSERT INTO template_items (id, template_id, category_id, item_type_id, title, description, priority, is_mandatory, sort_order) VALUES 
('323e4567-e89b-12d3-a456-426614174001', '223e4567-e89b-12d3-a456-426614174001', 'c23e4567-e89b-12d3-a456-426614174000', 'e23e4567-e89b-12d3-a456-426614174000', 
'Document React Components', 'Document all custom React components and their usage', 8, true, 1),
('423e4567-e89b-12d3-a456-426614174001', '223e4567-e89b-12d3-a456-426614174001', 'b23e4567-e89b-12d3-a456-426614174000', 'e23e4567-e89b-12d3-a456-426614174000', 
'Transfer GitHub Access', 'Ensure successor has access to all repositories', 9, true, 2),
('523e4567-e89b-12d3-a456-426614174001', '223e4567-e89b-12d3-a456-426614174001', 'd23e4567-e89b-12d3-a456-426614174000', 'f23e4567-e89b-12d3-a456-426614174000', 
'Share Technical Documentation', 'Upload all technical documentation and architecture diagrams', 7, true, 3)
ON CONFLICT DO NOTHING;

-- Insert sample handovers with various statuses and due dates for testing
INSERT INTO handovers (id, template_id, job_id, leaving_employee_name, leaving_employee_email, incoming_employee_name, incoming_employee_email, 
                      manager_name, manager_email, start_date, due_date, status, priority, notes) VALUES 

-- Overdue handover
('623e4567-e89b-12d3-a456-426614174001', '223e4567-e89b-12d3-a456-426614174001', '723e4567-e89b-12d3-a456-426614174000', 
'Alice Johnson', 'alice.johnson@ofir.ai', 'Bob Smith', 'bob.smith@ofir.ai', 
'John Manager', 'john.manager@ofir.ai', '2025-07-20', '2025-07-30', 'in_progress', 1, 'Critical handover - Alice leaving soon'),

-- Due today
('723e4567-e89b-12d3-a456-426614174001', '223e4567-e89b-12d3-a456-426614174001', '823e4567-e89b-12d3-a456-426614174000', 
'Charlie Brown', 'charlie.brown@ofir.ai', 'Diana Prince', 'diana.prince@ofir.ai', 
'John Manager', 'john.manager@ofir.ai', '2025-07-28', CURRENT_DATE, 'pending_review', 2, 'Waiting for manager approval'),

-- Due this week
('823e4567-e89b-12d3-a456-426614174001', '223e4567-e89b-12d3-a456-426614174001', '723e4567-e89b-12d3-a456-426614174000', 
'Eve Wilson', 'eve.wilson@ofir.ai', 'Frank Miller', 'frank.miller@ofir.ai', 
'Sarah Manager', 'sarah.manager@ofir.ai', '2025-08-01', CURRENT_DATE + 3, 'created', 3, 'New handover created'),

-- Due next week
('923e4567-e89b-12d3-a456-426614174001', '223e4567-e89b-12d3-a456-426614174001', '923e4567-e89b-12d3-a456-426614174000', 
'Grace Lee', 'grace.lee@ofir.ai', 'Henry Davis', 'henry.davis@ofir.ai', 
'Sarah Manager', 'sarah.manager@ofir.ai', '2025-08-05', CURRENT_DATE + 10, 'in_progress', 2, 'Product manager transition'),

-- Completed handover
('a23e4567-e89b-12d3-a456-426614174001', '223e4567-e89b-12d3-a456-426614174001', 'a23e4567-e89b-12d3-a456-426614174000', 
'Ivan Rodriguez', 'ivan.rodriguez@ofir.ai', 'Julia Kim', 'julia.kim@ofir.ai', 
'Hans Manager', 'hans.manager@ofir.ai', '2025-07-15', '2025-07-25', 'completed', 1, 'Successfully completed DevOps handover'),

-- Cancelled handover
('b23e4567-e89b-12d3-a456-426614174001', '223e4567-e89b-12d3-a456-426614174001', '823e4567-e89b-12d3-a456-426614174000', 
'Karen White', 'karen.white@ofir.ai', NULL, NULL, 
'John Manager', 'john.manager@ofir.ai', '2025-07-10', '2025-07-20', 'cancelled', 3, 'Employee decided to stay')

ON CONFLICT DO NOTHING;

-- Insert sample handover progress for realistic completion percentages
INSERT INTO handover_progress (id, handover_id, template_item_id, status, completion_notes, completed_at) VALUES 
-- Alice's handover (60% complete)
('c23e4567-e89b-12d3-a456-426614174001', '623e4567-e89b-12d3-a456-426614174001', '323e4567-e89b-12d3-a456-426614174001', 'completed', 'React components documented in Confluence', '2025-07-25 10:00:00'),
('d23e4567-e89b-12d3-a456-426614174001', '623e4567-e89b-12d3-a456-426614174001', '423e4567-e89b-12d3-a456-426614174001', 'completed', 'GitHub access transferred to Bob', '2025-07-26 14:30:00'),
('e23e4567-e89b-12d3-a456-426614174001', '623e4567-e89b-12d3-a456-426614174001', '523e4567-e89b-12d3-a456-426614174001', 'in_progress', 'Still gathering technical docs', NULL),

-- Charlie's handover (100% complete, pending review)
('f23e4567-e89b-12d3-a456-426614174001', '723e4567-e89b-12d3-a456-426614174001', '323e4567-e89b-12d3-a456-426614174001', 'completed', 'All components documented', '2025-08-02 09:00:00'),
('123e4567-e89b-12d3-a456-426614174002', '723e4567-e89b-12d3-a456-426614174001', '423e4567-e89b-12d3-a456-426614174001', 'completed', 'Access transferred', '2025-08-02 11:00:00'),
('223e4567-e89b-12d3-a456-426614174002', '723e4567-e89b-12d3-a456-426614174001', '523e4567-e89b-12d3-a456-426614174001', 'completed', 'All documentation uploaded', '2025-08-03 16:00:00'),

-- Eve's handover (20% complete)
('323e4567-e89b-12d3-a456-426614174002', '823e4567-e89b-12d3-a456-426614174001', '323e4567-e89b-12d3-a456-426614174001', 'in_progress', 'Started documenting components', NULL),
('423e4567-e89b-12d3-a456-426614174002', '823e4567-e89b-12d3-a456-426614174001', '423e4567-e89b-12d3-a456-426614174001', 'pending', 'Waiting for access approval', NULL),
('523e4567-e89b-12d3-a456-426614174002', '823e4567-e89b-12d3-a456-426614174001', '523e4567-e89b-12d3-a456-426614174001', 'pending', 'Not started yet', NULL),

-- Grace's handover (40% complete)
('623e4567-e89b-12d3-a456-426614174002', '923e4567-e89b-12d3-a456-426614174001', '323e4567-e89b-12d3-a456-426614174001', 'completed', 'Product requirements documented', '2025-08-01 13:00:00'),
('723e4567-e89b-12d3-a456-426614174002', '923e4567-e89b-12d3-a456-426614174001', '423e4567-e89b-12d3-a456-426614174001', 'in_progress', 'Working on access transfer', NULL),
('823e4567-e89b-12d3-a456-426614174002', '923e4567-e89b-12d3-a456-426614174001', '523e4567-e89b-12d3-a456-426614174001', 'pending', 'Scheduled for next week', NULL),

-- Ivan's handover (100% complete)
('923e4567-e89b-12d3-a456-426614174002', 'a23e4567-e89b-12d3-a456-426614174001', '323e4567-e89b-12d3-a456-426614174001', 'completed', 'Infrastructure documented', '2025-07-22 10:00:00'),
('a23e4567-e89b-12d3-a456-426614174002', 'a23e4567-e89b-12d3-a456-426614174001', '423e4567-e89b-12d3-a456-426614174001', 'completed', 'All access transferred', '2025-07-23 15:00:00'),
('b23e4567-e89b-12d3-a456-426614174002', 'a23e4567-e89b-12d3-a456-426614174001', '523e4567-e89b-12d3-a456-426614174001', 'completed', 'Complete DevOps runbooks uploaded', '2025-07-24 12:00:00')

ON CONFLICT DO NOTHING;

-- Add some user profiles (you'll need to create these users in Supabase Auth first)
-- These are examples - you'll need to replace with actual user IDs from auth.users
-- INSERT INTO user_profiles (id, email, full_name, role, plant_id, department_id) VALUES 
-- ('your-auth-user-id-1', 'john.manager@ofir.ai', 'John Manager', 'manager', '223e4567-e89b-12d3-a456-426614174000', '423e4567-e89b-12d3-a456-426614174000'),
-- ('your-auth-user-id-2', 'sarah.manager@ofir.ai', 'Sarah Manager', 'manager', '223e4567-e89b-12d3-a456-426614174000', '523e4567-e89b-12d3-a456-426614174000');

-- Update overdue handovers (call the function we created)
SELECT update_overdue_handovers();

COMMENT ON TABLE handovers IS 'Sample handovers for testing the Manager Dashboard';
COMMENT ON TABLE handover_progress IS 'Sample progress data for realistic completion percentages';