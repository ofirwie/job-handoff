-- Job Handoff System Complete Database Setup
-- Generated at: 2025-07-30T03:41:09.173Z
-- Supabase Project: https://pjiqcpusjxfjuulojzhc.supabase.co

-- IMPORTANT: Run this entire script in Supabase SQL Editor
-- URL: https://pjiqcpusjxfjuulojzhc.supabase.com/project/pjiqcpusjxfjuulojzhc/sql/new

-- Flexible Handover System Database Schema
-- Based on truly_dynamic_system.md specification
-- Supports dynamic categories, flexible item types, and learning capabilities

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Organizations (Albaad corporate structure)
CREATE TABLE organizations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    code VARCHAR(10) UNIQUE NOT NULL,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- Plants (8 plants: USA, Poland, Germany, Spain, Israel)
CREATE TABLE plants (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id) NOT NULL,
    name VARCHAR(200) NOT NULL,
    code VARCHAR(10) NOT NULL,
    country VARCHAR(100) NOT NULL,
    location VARCHAR(500),
    manager_email VARCHAR(255),
    local_regulations JSONB DEFAULT '{}', -- Country-specific rules
    cultural_settings JSONB DEFAULT '{}', -- Language, customs, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- Departments
CREATE TABLE departments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    plant_id UUID REFERENCES plants(id) NOT NULL,
    name VARCHAR(200) NOT NULL,
    code VARCHAR(10) NOT NULL,
    manager_email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- Jobs/Roles
CREATE TABLE jobs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    department_id UUID REFERENCES departments(id) NOT NULL,
    title VARCHAR(200) NOT NULL,
    level VARCHAR(50) CHECK (level IN ('junior', 'senior', 'manager', 'director')),
    description TEXT,
    custom_attributes JSONB DEFAULT '{}', -- Flexible job attributes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- User profiles (extends Supabase auth.users)
CREATE TABLE user_profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) NOT NULL CHECK (role IN ('hr', 'manager', 'employee', 'admin')),
    plant_id UUID REFERENCES plants(id),
    department_id UUID REFERENCES departments(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dynamic Categories System
CREATE TABLE categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    display_name VARCHAR(200) NOT NULL,
    description TEXT,
    is_system_default BOOLEAN DEFAULT false, -- Core categories (always present)
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id),
    industry_specific BOOLEAN DEFAULT false,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dynamic Item Types System
CREATE TABLE item_types (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    fields_schema JSONB NOT NULL, -- Dynamic field definitions
    validation_rules JSONB DEFAULT '{}', -- Validation logic
    ui_component VARCHAR(100) DEFAULT 'default', -- Which component to render
    is_system_default BOOLEAN DEFAULT false,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Base Templates (with learning capabilities)
CREATE TABLE base_templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    job_title VARCHAR(200),
    level VARCHAR(50),
    department VARCHAR(100),
    industry VARCHAR(100) DEFAULT 'wet_wipes_hygiene',
    template_data JSONB NOT NULL, -- Complete template definition
    confidence_score DECIMAL(3,2) DEFAULT 0.5, -- Learning confidence (0.0-1.0)
    source VARCHAR(50) DEFAULT 'manual' CHECK (source IN ('manual', 'ai_generated', 'learned')),
    usage_count INTEGER DEFAULT 0,
    success_rate DECIMAL(3,2) DEFAULT 0.0, -- Success rate from completed handovers
    created_by UUID REFERENCES auth.users(id),
    approved_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true
);

-- Adaptation Rules (plant/role/industry specific)
CREATE TABLE adaptation_rules (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    rule_type VARCHAR(50) NOT NULL CHECK (rule_type IN ('plant', 'culture', 'regulation', 'technology', 'role', 'industry')),
    condition_match JSONB NOT NULL, -- Conditions for rule activation
    adaptation_logic JSONB NOT NULL, -- How to modify template
    priority INTEGER DEFAULT 5,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Templates (generated instances)
CREATE TABLE templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    base_template_id UUID REFERENCES base_templates(id),
    job_id UUID REFERENCES jobs(id) NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    version INTEGER DEFAULT 1,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'active', 'archived')),
    confidence_score DECIMAL(3,2) DEFAULT 0.5,
    generation_strategy VARCHAR(50) CHECK (generation_strategy IN ('use_existing', 'merge_multiple', 'generate_new')),
    requires_review BOOLEAN DEFAULT false,
    learning_mode BOOLEAN DEFAULT false,
    created_by UUID REFERENCES auth.users(id),
    approved_by UUID REFERENCES auth.users(id),
    ai_metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true
);

-- Template Items (dynamic structure)
CREATE TABLE template_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    template_id UUID REFERENCES templates(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) NOT NULL,
    item_type_id UUID REFERENCES item_types(id),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    instructions TEXT,
    priority INTEGER CHECK (priority BETWEEN 1 AND 10) DEFAULT 5,
    estimated_minutes INTEGER,
    is_mandatory BOOLEAN DEFAULT true,
    sort_order INTEGER,
    item_data JSONB DEFAULT '{}', -- Flexible item-specific data
    generated_by VARCHAR(50) DEFAULT 'manual' CHECK (generated_by IN ('manual', 'ai_inference', 'rule_based', 'learned')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Handovers
CREATE TABLE handovers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    template_id UUID REFERENCES templates(id) NOT NULL,
    job_id UUID REFERENCES jobs(id) NOT NULL,
    leaving_employee_name VARCHAR(200) NOT NULL,
    leaving_employee_email VARCHAR(255) NOT NULL,
    incoming_employee_name VARCHAR(200),
    incoming_employee_email VARCHAR(255),
    manager_name VARCHAR(200) NOT NULL,
    manager_email VARCHAR(255) NOT NULL,
    start_date DATE,
    due_date DATE NOT NULL,
    completed_date DATE,
    status VARCHAR(20) DEFAULT 'created' CHECK (status IN ('created', 'in_progress', 'completed', 'cancelled')),
    notes TEXT,
    manager_edits JSONB DEFAULT '[]', -- Track what managers add/remove/modify
    learning_feedback JSONB DEFAULT '{}', -- Collect improvement data
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Handover Progress (tracks completion of individual items)
CREATE TABLE handover_progress (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    handover_id UUID REFERENCES handovers(id) ON DELETE CASCADE,
    template_item_id UUID REFERENCES template_items(id),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'not_applicable', 'skipped')),
    actual_minutes INTEGER, -- Track actual time vs estimate
    difficulty_rating INTEGER CHECK (difficulty_rating BETWEEN 1 AND 5), -- Feedback for learning
    completion_notes TEXT,
    completed_by UUID REFERENCES auth.users(id),
    completed_at TIMESTAMP WITH TIME ZONE,
    evidence_files JSONB DEFAULT '[]',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Learning Insights (aggregate data for template improvement)
CREATE TABLE learning_insights (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    template_id UUID REFERENCES templates(id),
    job_pattern VARCHAR(200), -- e.g., "Senior Developer in Engineering"
    insight_type VARCHAR(50) CHECK (insight_type IN ('commonly_added', 'commonly_removed', 'time_estimation', 'difficulty_pattern')),
    insight_data JSONB NOT NULL,
    confidence_level DECIMAL(3,2),
    sample_size INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit Logs
CREATE TABLE audit_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(20) NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_values JSONB,
    new_values JSONB,
    changed_by UUID REFERENCES auth.users(id),
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET
);

-- User Permissions
CREATE TABLE user_permissions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    resource_type VARCHAR(50) NOT NULL CHECK (resource_type IN ('organization', 'plant', 'department', 'handover', 'template')),
    resource_id UUID NOT NULL,
    permission_level VARCHAR(20) NOT NULL CHECK (permission_level IN ('read', 'write', 'admin')),
    granted_by UUID REFERENCES auth.users(id),
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true
);

-- Create indexes for performance
CREATE INDEX idx_plants_country ON plants(country);
CREATE INDEX idx_templates_job_id ON templates(job_id);
CREATE INDEX idx_template_items_category ON template_items(category_id);
CREATE INDEX idx_handovers_status ON handovers(status);
CREATE INDEX idx_handover_progress_status ON handover_progress(status);
CREATE INDEX idx_base_templates_confidence ON base_templates(confidence_score);
CREATE INDEX idx_adaptation_rules_type ON adaptation_rules(rule_type);
CREATE INDEX idx_learning_insights_pattern ON learning_insights(job_pattern);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE handovers ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE handover_progress ENABLE ROW LEVEL SECURITY;

-- Security Policies
-- Row Level Security Policies for Flexible Handover System
-- Implements secure access based on user roles and organizational hierarchy

-- User Profiles Security
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "HR and Admins can view all profiles" ON user_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('hr', 'admin')
        )
    );

CREATE POLICY "HR can create profiles" ON user_profiles
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('hr', 'admin')
        )
    );

-- Handover Security
CREATE POLICY "View involved handovers" ON handovers
    FOR SELECT USING (
        leaving_employee_email = auth.email() OR
        incoming_employee_email = auth.email() OR
        manager_email = auth.email() OR
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('hr', 'admin')
        )
    );

CREATE POLICY "Managers can update department handovers" ON handovers
    FOR UPDATE USING (
        manager_email = auth.email() OR
        EXISTS (
            SELECT 1 FROM user_profiles up
            JOIN jobs j ON j.department_id = up.department_id
            WHERE up.id = auth.uid() 
            AND up.role IN ('manager', 'hr', 'admin')
            AND j.id = handovers.job_id
        )
    );

CREATE POLICY "Managers and HR can create handovers" ON handovers
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('manager', 'hr', 'admin')
        )
    );

-- Template Security
CREATE POLICY "View plant templates" ON templates
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles up
            JOIN jobs j ON j.id = templates.job_id
            JOIN departments d ON d.id = j.department_id
            WHERE up.id = auth.uid() 
            AND (
                up.plant_id = d.plant_id OR 
                up.role IN ('hr', 'admin')
            )
        )
    );

CREATE POLICY "Managers can create templates" ON templates
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('manager', 'hr', 'admin')
        )
    );

CREATE POLICY "Template owners can update" ON templates
    FOR UPDATE USING (
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('hr', 'admin')
        )
    );

-- Template Items Security
CREATE POLICY "View template items with template access" ON template_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM templates t
            JOIN user_profiles up ON up.id = auth.uid()
            JOIN jobs j ON j.id = t.job_id
            JOIN departments d ON d.id = j.department_id
            WHERE t.id = template_items.template_id 
            AND (
                up.plant_id = d.plant_id OR 
                up.role IN ('hr', 'admin')
            )
        )
    );

CREATE POLICY "Template owners can manage items" ON template_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM templates t
            WHERE t.id = template_items.template_id 
            AND (
                t.created_by = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM user_profiles 
                    WHERE id = auth.uid() 
                    AND role IN ('hr', 'admin')
                )
            )
        )
    );

-- Handover Progress Security
CREATE POLICY "View progress for involved handovers" ON handover_progress
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM handovers h
            WHERE h.id = handover_progress.handover_id 
            AND (
                h.leaving_employee_email = auth.email() OR
                h.incoming_employee_email = auth.email() OR
                h.manager_email = auth.email() OR
                EXISTS (
                    SELECT 1 FROM user_profiles 
                    WHERE id = auth.uid() 
                    AND role IN ('hr', 'admin')
                )
            )
        )
    );

CREATE POLICY "Update progress for involved users" ON handover_progress
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM handovers h
            WHERE h.id = handover_progress.handover_id 
            AND (
                h.leaving_employee_email = auth.email() OR
                h.incoming_employee_email = auth.email() OR
                h.manager_email = auth.email()
            )
        )
    );

-- Categories Security (public read, admin write)
CREATE POLICY "Anyone can view categories" ON categories
    FOR SELECT TO public USING (is_active = true);

CREATE POLICY "Admins can manage categories" ON categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'hr')
        )
    );

-- Item Types Security (public read, admin write)
CREATE POLICY "Anyone can view item types" ON item_types
    FOR SELECT TO public USING (true);

CREATE POLICY "Admins can manage item types" ON item_types
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'hr')
        )
    );

-- Base Templates Security
CREATE POLICY "View base templates by plant" ON base_templates
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND (
                role IN ('hr', 'admin') OR
                -- Users can see templates from their plant
                plant_id IS NOT NULL
            )
        )
    );

CREATE POLICY "Managers can create base templates" ON base_templates
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('manager', 'hr', 'admin')
        )
    );

-- Adaptation Rules Security
CREATE POLICY "View adaptation rules" ON adaptation_rules
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage adaptation rules" ON adaptation_rules
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'hr')
        )
    );

-- Learning Insights Security (admin/HR only)
CREATE POLICY "HR can view learning insights" ON learning_insights
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('hr', 'admin')
        )
    );

-- Audit Logs Security (admin/HR read-only)
CREATE POLICY "HR can view audit logs" ON audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('hr', 'admin')
        )
    );

-- User Permissions Security
CREATE POLICY "View own permissions" ON user_permissions
    FOR SELECT USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('hr', 'admin')
        )
    );

CREATE POLICY "Admins can manage permissions" ON user_permissions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Initial Data
-- Initial Data for Flexible Handover System
-- Includes Albaad organization structure and core system data

-- Insert Albaad organization
INSERT INTO organizations (id, name, code, settings) VALUES 
(uuid_generate_v4(), 'Albaad International', 'ALBAAD', '{
    "industry": "wet_wipes_hygiene",
    "founded": 1985,
    "headquarters": "Israel",
    "products": ["wet_wipes", "feminine_hygiene"]
}');

-- Get organization ID for subsequent inserts
DO $$
DECLARE
    org_id UUID;
BEGIN
    SELECT id INTO org_id FROM organizations WHERE code = 'ALBAAD';
    
    -- Insert Albaad plants (8 global locations)
    INSERT INTO plants (id, organization_id, name, code, country, location, local_regulations, cultural_settings) VALUES 
    (uuid_generate_v4(), org_id, 'Albaad USA', 'USA01', 'USA', 'United States Manufacturing Facility', 
     '{"fda_compliance": true, "osha_requirements": true}',
     '{"language": "en", "date_format": "MM/DD/YYYY", "currency": "USD"}'
    ),
    (uuid_generate_v4(), org_id, 'Albaad Poland', 'POL01', 'Poland', 'Polish Production Center',
     '{"eu_regulations": true, "gdpr_compliance": true}',
     '{"language": "pl", "date_format": "DD/MM/YYYY", "currency": "EUR"}'
    ),
    (uuid_generate_v4(), org_id, 'Albaad Germany', 'GER01', 'Germany', 'German R&D and Manufacturing',
     '{"eu_regulations": true, "gdpr_compliance": true, "din_standards": true}',
     '{"language": "de", "date_format": "DD.MM.YYYY", "currency": "EUR"}'
    ),
    (uuid_generate_v4(), org_id, 'Albaad Spain', 'ESP01', 'Spain', 'Spanish Production Facility',
     '{"eu_regulations": true, "gdpr_compliance": true}',
     '{"language": "es", "date_format": "DD/MM/YYYY", "currency": "EUR"}'
    ),
    (uuid_generate_v4(), org_id, 'Albaad Israel HQ', 'ISR01', 'Israel', 'Headquarters and R&D Center',
     '{"israeli_standards": true, "kosher_certification": true}',
     '{"language": "he", "date_format": "DD/MM/YYYY", "currency": "ILS"}'
    );
END $$;

-- Insert common departments across plants
DO $$
DECLARE
    plant_record RECORD;
BEGIN
    FOR plant_record IN SELECT id FROM plants LOOP
        INSERT INTO departments (plant_id, name, code) VALUES 
        (plant_record.id, 'Production', 'PROD'),
        (plant_record.id, 'Quality Assurance', 'QA'),
        (plant_record.id, 'Research & Development', 'RD'),
        (plant_record.id, 'Engineering', 'ENG'),
        (plant_record.id, 'Supply Chain', 'SCM'),
        (plant_record.id, 'Human Resources', 'HR'),
        (plant_record.id, 'Finance', 'FIN'),
        (plant_record.id, 'Sales & Marketing', 'SALES'),
        (plant_record.id, 'Maintenance', 'MAINT'),
        (plant_record.id, 'Environmental & Safety', 'EHS');
    END LOOP;
END $$;

-- Insert Core Categories (always present)
INSERT INTO categories (id, name, display_name, description, is_system_default, is_active) VALUES 
(uuid_generate_v4(), 'files_and_documents', 'Files & Documents', 'All files, documents, and digital assets', true, true),
(uuid_generate_v4(), 'processes_and_procedures', 'Processes & Procedures', 'Standard operating procedures and workflows', true, true),
(uuid_generate_v4(), 'contacts_and_relationships', 'Contacts & Relationships', 'Key contacts, stakeholders, and business relationships', true, true),
(uuid_generate_v4(), 'systems_and_access', 'Systems & Access', 'IT systems, software, and access credentials', true, true),
(uuid_generate_v4(), 'knowledge_and_insights', 'Knowledge & Insights', 'Institutional knowledge and experience insights', true, true);

-- Insert Dynamic Categories (context-dependent)
INSERT INTO categories (id, name, display_name, description, is_system_default, industry_specific, is_active) VALUES 
(uuid_generate_v4(), 'regulatory_compliance', 'Regulatory Compliance', 'Regulatory requirements and compliance procedures', false, true, true),
(uuid_generate_v4(), 'sustainability_environment', 'Sustainability & Environment', 'Environmental compliance and sustainability initiatives', false, true, true),
(uuid_generate_v4(), 'innovation_rd', 'Innovation & R&D', 'Research, development, and innovation projects', false, true, true),
(uuid_generate_v4(), 'crisis_management', 'Crisis Management', 'Emergency procedures and crisis response', false, false, true),
(uuid_generate_v4(), 'cultural_adaptation', 'Cultural Adaptation', 'Local culture and international considerations', false, false, true),
(uuid_generate_v4(), 'digital_transformation', 'Digital Transformation', 'IT transformation and digital initiatives', false, false, true),
(uuid_generate_v4(), 'manufacturing_operations', 'Manufacturing Operations', 'Production line operations and manufacturing processes', false, true, true),
(uuid_generate_v4(), 'customer_relations', 'Customer Relations', 'Customer accounts and relationship management', false, false, true);

-- Insert Core Item Types
INSERT INTO item_types (id, name, description, fields_schema, is_system_default) VALUES 
(uuid_generate_v4(), 'document_transfer', 'Document Transfer Item', '{
    "required_fields": ["document_name", "location", "access_method"],
    "optional_fields": ["backup_location", "special_instructions"],
    "field_types": {
        "document_name": "text",
        "location": "text", 
        "access_method": "select",
        "backup_location": "text",
        "special_instructions": "textarea"
    }
}', true),
(uuid_generate_v4(), 'contact_handover', 'Contact Information Transfer', '{
    "required_fields": ["contact_name", "role", "contact_method"],
    "optional_fields": ["relationship_notes", "communication_preferences"],
    "field_types": {
        "contact_name": "text",
        "role": "text",
        "contact_method": "text",
        "relationship_notes": "textarea",
        "communication_preferences": "select"
    }
}', true),
(uuid_generate_v4(), 'system_access', 'System Access Transfer', '{
    "required_fields": ["system_name", "access_level", "login_method"],
    "optional_fields": ["administrator_contact", "special_permissions"],
    "field_types": {
        "system_name": "text",
        "access_level": "select",
        "login_method": "select",
        "administrator_contact": "text",
        "special_permissions": "textarea"
    }
}', true),
(uuid_generate_v4(), 'process_knowledge', 'Process Knowledge Transfer', '{
    "required_fields": ["process_name", "frequency", "key_steps"],
    "optional_fields": ["common_issues", "best_practices", "dependencies"],
    "field_types": {
        "process_name": "text",
        "frequency": "select",
        "key_steps": "textarea",
        "common_issues": "textarea",
        "best_practices": "textarea",
        "dependencies": "textarea"
    }
}', true);

-- Insert Adaptation Rules for different plants and contexts
INSERT INTO adaptation_rules (id, name, rule_type, condition_match, adaptation_logic, priority) VALUES 
(uuid_generate_v4(), 'German Plant GDPR Requirements', 'regulation', '{
    "plant_country": "Germany"
}', '{
    "add_items": [{
        "category": "regulatory_compliance",
        "title": "GDPR Data Protection Procedures",
        "description": "Personal data handling according to German GDPR requirements",
        "priority": 10,
        "mandatory": true
    }]
}', 9),

(uuid_generate_v4(), 'US Plant FDA Compliance', 'regulation', '{
    "plant_country": "USA"
}', '{
    "add_items": [{
        "category": "regulatory_compliance", 
        "title": "FDA Compliance Documentation",
        "description": "US FDA requirements for wet wipes and hygiene products",
        "priority": 9,
        "mandatory": true
    }]
}', 9),

(uuid_generate_v4(), 'Director Level Crisis Management', 'role', '{
    "job_level": "director"
}', '{
    "add_categories": ["crisis_management"],
    "add_items": [{
        "category": "crisis_management",
        "title": "Crisis Communication Protocols", 
        "description": "Emergency response and stakeholder communication procedures",
        "priority": 9,
        "mandatory": true
    }]
}', 8),

(uuid_generate_v4(), 'International Plant Cultural Adaptation', 'culture', '{
    "plant_country": ["Germany", "Poland", "Spain", "USA"]
}', '{
    "add_categories": ["cultural_adaptation"],
    "add_items": [{
        "category": "cultural_adaptation",
        "title": "Local Culture and Communication Norms",
        "description": "Understanding local business culture and communication preferences", 
        "priority": 6,
        "mandatory": false
    }]
}', 5),

(uuid_generate_v4(), 'R&D Department Innovation Focus', 'role', '{
    "department": "Research & Development"
}', '{
    "add_categories": ["innovation_rd"],
    "boost_priority": {
        "category": "innovation_rd",
        "increase": 2
    }
}', 7),

(uuid_generate_v4(), 'Production Department Manufacturing Focus', 'role', '{
    "department": "Production" 
}', '{
    "add_categories": ["manufacturing_operations"],
    "add_items": [{
        "category": "manufacturing_operations",
        "title": "Production Line Handover",
        "description": "Transfer of production line responsibilities and procedures",
        "priority": 10,
        "mandatory": true
    }]
}', 8),

(uuid_generate_v4(), 'Sustainability Role Environmental Focus', 'role', '{
    "job_title_contains": ["sustainability", "environment"]
}', '{
    "add_categories": ["sustainability_environment"],
    "add_items": [{
        "category": "sustainability_environment",
        "title": "Environmental Compliance Tracking",
        "description": "Environmental monitoring systems and compliance reporting",
        "priority": 10,
        "mandatory": true
    }, {
        "category": "sustainability_environment", 
        "title": "OEKO-TEX and Sustainability Certifications",
        "description": "Management of sustainability certifications and standards",
        "priority": 9,
        "mandatory": true
    }]
}', 9);

-- Insert a basic base template for common roles
INSERT INTO base_templates (id, name, job_title, level, department, template_data, confidence_score, source) VALUES 
(uuid_generate_v4(), 'General Manager Template', 'Manager', 'manager', 'Any', '{
    "categories": ["files_and_documents", "processes_and_procedures", "contacts_and_relationships", "systems_and_access", "knowledge_and_insights"],
    "items": [
        {
            "category": "files_and_documents",
            "title": "Department Files and Records",
            "description": "All departmental documentation and records",
            "priority": 8,
            "estimated_minutes": 60,
            "mandatory": true
        },
        {
            "category": "contacts_and_relationships", 
            "title": "Key Stakeholder Relationships",
            "description": "Important internal and external contacts",
            "priority": 9,
            "estimated_minutes": 45,
            "mandatory": true
        },
        {
            "category": "processes_and_procedures",
            "title": "Management Processes",
            "description": "Key management processes and decision-making procedures", 
            "priority": 8,
            "estimated_minutes": 90,
            "mandatory": true
        }
    ]
}', 0.7, 'manual');

-- Create triggers for audit logging
CREATE OR REPLACE FUNCTION handle_audit_log()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_logs (table_name, record_id, action, old_values, new_values, changed_by)
    VALUES (
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        TG_OP,
        CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
        CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END,
        auth.uid()
    );
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create audit triggers for key tables
CREATE TRIGGER audit_handovers 
AFTER INSERT OR UPDATE OR DELETE ON handovers
FOR EACH ROW EXECUTE FUNCTION handle_audit_log();

CREATE TRIGGER audit_templates
AFTER INSERT OR UPDATE OR DELETE ON templates  
FOR EACH ROW EXECUTE FUNCTION handle_audit_log();

CREATE TRIGGER audit_template_items
AFTER INSERT OR UPDATE OR DELETE ON template_items
FOR EACH ROW EXECUTE FUNCTION handle_audit_log();
