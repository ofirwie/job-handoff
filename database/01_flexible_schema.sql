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