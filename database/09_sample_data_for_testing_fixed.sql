-- Sample Data for Manager Dashboard Testing - FIXED VERSION
-- Run this after applying the main schema and enhancements

-- First, let's check if data already exists and only insert if it doesn't

-- Insert sample organization (only if it doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM organizations WHERE code = 'OFIR') THEN
    INSERT INTO organizations (id, name, code, settings) VALUES 
    ('123e4567-e89b-12d3-a456-426614174000', 'OFIR AI Corp', 'OFIR', '{}');
  END IF;
END $$;

-- Insert sample plants (only if they don't exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM plants WHERE code = 'SV') THEN
    INSERT INTO plants (id, organization_id, name, code, country, location, manager_email) VALUES 
    ('223e4567-e89b-12d3-a456-426614174000', '123e4567-e89b-12d3-a456-426614174000', 'Silicon Valley HQ', 'SV', 'USA', 'Palo Alto, CA', 'plant.manager@ofir.ai');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM plants WHERE code = 'BER') THEN
    INSERT INTO plants (id, organization_id, name, code, country, location, manager_email) VALUES 
    ('323e4567-e89b-12d3-a456-426614174000', '123e4567-e89b-12d3-a456-426614174000', 'Berlin Office', 'BER', 'Germany', 'Berlin, DE', 'berlin.manager@ofir.ai');
  END IF;
END $$;

-- Insert sample departments (only if they don't exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM departments WHERE code = 'ENG' AND plant_id = '223e4567-e89b-12d3-a456-426614174000') THEN
    INSERT INTO departments (id, plant_id, name, code, manager_email) VALUES 
    ('423e4567-e89b-12d3-a456-426614174000', '223e4567-e89b-12d3-a456-426614174000', 'Engineering', 'ENG', 'john.manager@ofir.ai');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM departments WHERE code = 'PROD' AND plant_id = '223e4567-e89b-12d3-a456-426614174000') THEN
    INSERT INTO departments (id, plant_id, name, code, manager_email) VALUES 
    ('523e4567-e89b-12d3-a456-426614174000', '223e4567-e89b-12d3-a456-426614174000', 'Product', 'PROD', 'sarah.manager@ofir.ai');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM departments WHERE code = 'ENG-BER' AND plant_id = '323e4567-e89b-12d3-a456-426614174000') THEN
    INSERT INTO departments (id, plant_id, name, code, manager_email) VALUES 
    ('623e4567-e89b-12d3-a456-426614174000', '323e4567-e89b-12d3-a456-426614174000', 'Engineering', 'ENG-BER', 'hans.manager@ofir.ai');
  END IF;
END $$;

-- Insert sample jobs (only if they don't exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM jobs WHERE id = '723e4567-e89b-12d3-a456-426614174000') THEN
    INSERT INTO jobs (id, department_id, title, level, description) VALUES 
    ('723e4567-e89b-12d3-a456-426614174000', '423e4567-e89b-12d3-a456-426614174000', 'Senior Frontend Developer', 'senior', 'React and TypeScript development');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM jobs WHERE id = '823e4567-e89b-12d3-a456-426614174000') THEN
    INSERT INTO jobs (id, department_id, title, level, description) VALUES 
    ('823e4567-e89b-12d3-a456-426614174000', '423e4567-e89b-12d3-a456-426614174000', 'Backend Engineer', 'senior', 'Node.js and database development');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM jobs WHERE id = '923e4567-e89b-12d3-a456-426614174000') THEN
    INSERT INTO jobs (id, department_id, title, level, description) VALUES 
    ('923e4567-e89b-12d3-a456-426614174000', '523e4567-e89b-12d3-a456-426614174000', 'Product Manager', 'manager', 'Product strategy and roadmap');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM jobs WHERE id = 'a23e4567-e89b-12d3-a456-426614174000') THEN
    INSERT INTO jobs (id, department_id, title, level, description) VALUES 
    ('a23e4567-e89b-12d3-a456-426614174000', '623e4567-e89b-12d3-a456-426614174000', 'DevOps Engineer', 'senior', 'Infrastructure and deployment');
  END IF;
END $$;

-- Insert sample categories (only if they don't exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM categories WHERE name = 'access_handover') THEN
    INSERT INTO categories (id, name, display_name, description, is_system_default) VALUES 
    ('b23e4567-e89b-12d3-a456-426614174000', 'access_handover', 'Access & Permissions', 'System access and permissions handover', true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM categories WHERE name = 'project_handover') THEN
    INSERT INTO categories (id, name, display_name, description, is_system_default) VALUES 
    ('c23e4567-e89b-12d3-a456-426614174000', 'project_handover', 'Project Documentation', 'Active projects and documentation', true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM categories WHERE name = 'knowledge_transfer') THEN
    INSERT INTO categories (id, name, display_name, description, is_system_default) VALUES 
    ('d23e4567-e89b-12d3-a456-426614174000', 'knowledge_transfer', 'Knowledge Transfer', 'Domain knowledge and best practices', true);
  END IF;
END $$;

-- Insert sample item types (only if they don't exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM item_types WHERE name = 'checklist_item') THEN
    INSERT INTO item_types (id, name, description, fields_schema) VALUES 
    ('e23e4567-e89b-12d3-a456-426614174000', 'checklist_item', 'Simple checklist item', '{"type": "boolean", "label": "Completed"}');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM item_types WHERE name = 'document_upload') THEN
    INSERT INTO item_types (id, name, description, fields_schema) VALUES 
    ('f23e4567-e89b-12d3-a456-426614174000', 'document_upload', 'Document upload', '{"type": "file", "label": "Upload Document"}');
  END IF;
END $$;

-- Insert sample base template (only if it doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM base_templates WHERE id = '123e4567-e89b-12d3-a456-426614174001') THEN
    INSERT INTO base_templates (id, name, job_title, level, department, template_data, source) VALUES 
    ('123e4567-e89b-12d3-a456-426614174001', 'Senior Developer Handover', 'Senior Frontend Developer', 'senior', 'Engineering', 
    '{"sections": [{"name": "Projects", "items": ["Document current projects", "Transfer code repositories"]}, {"name": "Access", "items": ["Review system access", "Transfer credentials"]}]}', 
    'manual');
  END IF;
END $$;

-- Insert sample template (only if it doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM templates WHERE id = '223e4567-e89b-12d3-a456-426614174001') THEN
    INSERT INTO templates (id, base_template_id, job_id, name, description, status) VALUES 
    ('223e4567-e89b-12d3-a456-426614174001', '123e4567-e89b-12d3-a456-426614174001', '723e4567-e89b-12d3-a456-426614174000', 
    'Frontend Developer Handover Template', 'Standard handover for frontend developers', 'active');
  END IF;
END $$;

-- Insert sample template items (only if they don't exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM template_items WHERE id = '323e4567-e89b-12d3-a456-426614174001') THEN
    INSERT INTO template_items (id, template_id, category_id, item_type_id, title, description, priority, is_mandatory, sort_order) VALUES 
    ('323e4567-e89b-12d3-a456-426614174001', '223e4567-e89b-12d3-a456-426614174001', 'c23e4567-e89b-12d3-a456-426614174000', 'e23e4567-e89b-12d3-a456-426614174000', 
    'Document React Components', 'Document all custom React components and their usage', 8, true, 1);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM template_items WHERE id = '423e4567-e89b-12d3-a456-426614174001') THEN
    INSERT INTO template_items (id, template_id, category_id, item_type_id, title, description, priority, is_mandatory, sort_order) VALUES 
    ('423e4567-e89b-12d3-a456-426614174001', '223e4567-e89b-12d3-a456-426614174001', 'b23e4567-e89b-12d3-a456-426614174000', 'e23e4567-e89b-12d3-a456-426614174000', 
    'Transfer GitHub Access', 'Ensure successor has access to all repositories', 9, true, 2);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM template_items WHERE id = '523e4567-e89b-12d3-a456-426614174001') THEN
    INSERT INTO template_items (id, template_id, category_id, item_type_id, title, description, priority, is_mandatory, sort_order) VALUES 
    ('523e4567-e89b-12d3-a456-426614174001', '223e4567-e89b-12d3-a456-426614174001', 'd23e4567-e89b-12d3-a456-426614174000', 'f23e4567-e89b-12d3-a456-426614174000', 
    'Share Technical Documentation', 'Upload all technical documentation and architecture diagrams', 7, true, 3);
  END IF;
END $$;

-- Insert sample handovers with various statuses and due dates for testing (only if they don't exist)
DO $$
BEGIN
  -- Overdue handover
  IF NOT EXISTS (SELECT 1 FROM handovers WHERE id = '623e4567-e89b-12d3-a456-426614174001') THEN
    INSERT INTO handovers (id, template_id, job_id, leaving_employee_name, leaving_employee_email, incoming_employee_name, incoming_employee_email, 
                          manager_name, manager_email, start_date, due_date, status, priority, notes) VALUES 
    ('623e4567-e89b-12d3-a456-426614174001', '223e4567-e89b-12d3-a456-426614174001', '723e4567-e89b-12d3-a456-426614174000', 
    'Alice Johnson', 'alice.johnson@ofir.ai', 'Bob Smith', 'bob.smith@ofir.ai', 
    'John Manager', 'john.manager@ofir.ai', '2025-07-20', '2025-07-30', 'in_progress', 1, 'Critical handover - Alice leaving soon');
  END IF;

  -- Due today
  IF NOT EXISTS (SELECT 1 FROM handovers WHERE id = '723e4567-e89b-12d3-a456-426614174001') THEN
    INSERT INTO handovers (id, template_id, job_id, leaving_employee_name, leaving_employee_email, incoming_employee_name, incoming_employee_email, 
                          manager_name, manager_email, start_date, due_date, status, priority, notes) VALUES 
    ('723e4567-e89b-12d3-a456-426614174001', '223e4567-e89b-12d3-a456-426614174001', '823e4567-e89b-12d3-a456-426614174000', 
    'Charlie Brown', 'charlie.brown@ofir.ai', 'Diana Prince', 'diana.prince@ofir.ai', 
    'John Manager', 'john.manager@ofir.ai', '2025-07-28', CURRENT_DATE, 'pending_review', 2, 'Waiting for manager approval');
  END IF;

  -- Due this week
  IF NOT EXISTS (SELECT 1 FROM handovers WHERE id = '823e4567-e89b-12d3-a456-426614174001') THEN
    INSERT INTO handovers (id, template_id, job_id, leaving_employee_name, leaving_employee_email, incoming_employee_name, incoming_employee_email, 
                          manager_name, manager_email, start_date, due_date, status, priority, notes) VALUES 
    ('823e4567-e89b-12d3-a456-426614174001', '223e4567-e89b-12d3-a456-426614174001', '723e4567-e89b-12d3-a456-426614174000', 
    'Eve Wilson', 'eve.wilson@ofir.ai', 'Frank Miller', 'frank.miller@ofir.ai', 
    'Sarah Manager', 'sarah.manager@ofir.ai', '2025-08-01', CURRENT_DATE + 3, 'created', 3, 'New handover created');
  END IF;

  -- Due next week
  IF NOT EXISTS (SELECT 1 FROM handovers WHERE id = '923e4567-e89b-12d3-a456-426614174001') THEN
    INSERT INTO handovers (id, template_id, job_id, leaving_employee_name, leaving_employee_email, incoming_employee_name, incoming_employee_email, 
                          manager_name, manager_email, start_date, due_date, status, priority, notes) VALUES 
    ('923e4567-e89b-12d3-a456-426614174001', '223e4567-e89b-12d3-a456-426614174001', '923e4567-e89b-12d3-a456-426614174000', 
    'Grace Lee', 'grace.lee@ofir.ai', 'Henry Davis', 'henry.davis@ofir.ai', 
    'Sarah Manager', 'sarah.manager@ofir.ai', '2025-08-05', CURRENT_DATE + 10, 'in_progress', 2, 'Product manager transition');
  END IF;

  -- Completed handover
  IF NOT EXISTS (SELECT 1 FROM handovers WHERE id = 'a23e4567-e89b-12d3-a456-426614174001') THEN
    INSERT INTO handovers (id, template_id, job_id, leaving_employee_name, leaving_employee_email, incoming_employee_name, incoming_employee_email, 
                          manager_name, manager_email, start_date, due_date, status, priority, notes) VALUES 
    ('a23e4567-e89b-12d3-a456-426614174001', '223e4567-e89b-12d3-a456-426614174001', 'a23e4567-e89b-12d3-a456-426614174000', 
    'Ivan Rodriguez', 'ivan.rodriguez@ofir.ai', 'Julia Kim', 'julia.kim@ofir.ai', 
    'Hans Manager', 'hans.manager@ofir.ai', '2025-07-15', '2025-07-25', 'completed', 1, 'Successfully completed DevOps handover');
  END IF;

  -- Cancelled handover
  IF NOT EXISTS (SELECT 1 FROM handovers WHERE id = 'b23e4567-e89b-12d3-a456-426614174001') THEN
    INSERT INTO handovers (id, template_id, job_id, leaving_employee_name, leaving_employee_email, incoming_employee_name, incoming_employee_email, 
                          manager_name, manager_email, start_date, due_date, status, priority, notes) VALUES 
    ('b23e4567-e89b-12d3-a456-426614174001', '223e4567-e89b-12d3-a456-426614174001', '823e4567-e89b-12d3-a456-426614174000', 
    'Karen White', 'karen.white@ofir.ai', NULL, NULL, 
    'John Manager', 'john.manager@ofir.ai', '2025-07-10', '2025-07-20', 'cancelled', 3, 'Employee decided to stay');
  END IF;
END $$;

-- Insert sample handover progress for realistic completion percentages (only if they don't exist)
DO $$
BEGIN
  -- Alice's handover (60% complete)
  IF NOT EXISTS (SELECT 1 FROM handover_progress WHERE id = 'c23e4567-e89b-12d3-a456-426614174001') THEN
    INSERT INTO handover_progress (id, handover_id, template_item_id, status, completion_notes, completed_at) VALUES 
    ('c23e4567-e89b-12d3-a456-426614174001', '623e4567-e89b-12d3-a456-426614174001', '323e4567-e89b-12d3-a456-426614174001', 'completed', 'React components documented in Confluence', '2025-07-25 10:00:00');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM handover_progress WHERE id = 'd23e4567-e89b-12d3-a456-426614174001') THEN
    INSERT INTO handover_progress (id, handover_id, template_item_id, status, completion_notes, completed_at) VALUES 
    ('d23e4567-e89b-12d3-a456-426614174001', '623e4567-e89b-12d3-a456-426614174001', '423e4567-e89b-12d3-a456-426614174001', 'completed', 'GitHub access transferred to Bob', '2025-07-26 14:30:00');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM handover_progress WHERE id = 'e23e4567-e89b-12d3-a456-426614174001') THEN
    INSERT INTO handover_progress (id, handover_id, template_item_id, status, completion_notes) VALUES 
    ('e23e4567-e89b-12d3-a456-426614174001', '623e4567-e89b-12d3-a456-426614174001', '523e4567-e89b-12d3-a456-426614174001', 'in_progress', 'Still gathering technical docs');
  END IF;
END $$;

-- Update overdue handovers (call the function we created)
SELECT update_overdue_handovers();

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Sample data inserted successfully! You can now test the Manager Dashboard.';
END $$;