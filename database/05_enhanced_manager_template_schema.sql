-- Enhanced Manager-Template Integration Schema
-- Adds missing manager-template connections and functionality

-- Enhance existing templates table with manager ownership
ALTER TABLE templates ADD COLUMN IF NOT EXISTS manager_id UUID REFERENCES auth.users(id);
ALTER TABLE templates ADD COLUMN IF NOT EXISTS department TEXT;
ALTER TABLE templates ADD COLUMN IF NOT EXISTS is_department_standard BOOLEAN DEFAULT false;
ALTER TABLE templates ADD COLUMN IF NOT EXISTS template_version INTEGER DEFAULT 1;
ALTER TABLE templates ADD COLUMN IF NOT EXISTS parent_template_id UUID REFERENCES templates(id);
ALTER TABLE templates ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'archived', 'deprecated'));

-- Template permissions system
CREATE TABLE template_permissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    template_id UUID REFERENCES templates(id) ON DELETE CASCADE,
    user_email TEXT NOT NULL,
    permission_type TEXT NOT NULL CHECK (permission_type IN ('view', 'edit', 'delete', 'share', 'clone')),
    granted_by TEXT NOT NULL,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true
);

-- RLS for template permissions
ALTER TABLE template_permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view permissions where they have access" ON template_permissions FOR SELECT USING (
    user_email = auth.jwt() ->> 'email' OR 
    granted_by = auth.jwt() ->> 'email' OR
    auth.jwt() ->> 'role' IN ('admin', 'manager')
);

-- Template feedback and improvement system
CREATE TABLE template_feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    template_id UUID REFERENCES templates(id) ON DELETE CASCADE,
    handover_id UUID REFERENCES handovers(id),
    submitted_by TEXT NOT NULL,
    submitter_role TEXT NOT NULL CHECK (submitter_role IN ('employee', 'manager', 'successor')),
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    completion_time_hours DECIMAL,
    missing_items TEXT[],
    unnecessary_items TEXT[],
    unclear_instructions TEXT[],
    suggestions TEXT,
    would_recommend BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for template feedback
ALTER TABLE template_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can submit feedback for their handovers" ON template_feedback FOR INSERT WITH CHECK (
    submitted_by = auth.jwt() ->> 'email'
);
CREATE POLICY "Users can view feedback they submitted" ON template_feedback FOR SELECT USING (
    submitted_by = auth.jwt() ->> 'email'
);
CREATE POLICY "Managers can view team feedback" ON template_feedback FOR SELECT USING (
    handover_id IN (
        SELECT id FROM handovers WHERE manager_email = auth.jwt() ->> 'email'
    )
);

-- Template effectiveness metrics
CREATE TABLE template_metrics (
    template_id UUID PRIMARY KEY REFERENCES templates(id) ON DELETE CASCADE,
    usage_count INTEGER DEFAULT 0,
    avg_completion_time_hours DECIMAL,
    avg_success_rating DECIMAL,
    completion_rate DECIMAL, -- percentage of handovers completed successfully
    avg_time_to_complete_days DECIMAL,
    feedback_count INTEGER DEFAULT 0,
    recommendation_rate DECIMAL, -- percentage who would recommend
    last_calculated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Manager template preferences and customizations
CREATE TABLE manager_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    manager_email TEXT NOT NULL,
    department TEXT,
    preferred_template_ids UUID[],
    custom_instructions JSONB DEFAULT '{}',
    notification_settings JSONB DEFAULT '{
        "new_handover": true,
        "handover_completed": true,
        "template_feedback": true,
        "template_updates": true
    }',
    auto_approve_settings JSONB DEFAULT '{
        "trusted_employees": [],
        "auto_approve_score_threshold": 4.5
    }',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(manager_email, department)
);

-- RLS for manager preferences
ALTER TABLE manager_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Managers can manage their own preferences" ON manager_preferences FOR ALL USING (
    manager_email = auth.jwt() ->> 'email'
);

-- Template customization overrides
CREATE TABLE template_overrides (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    base_template_id UUID REFERENCES templates(id) ON DELETE CASCADE,
    manager_email TEXT NOT NULL,
    department TEXT,
    override_name TEXT NOT NULL,
    custom_sections JSONB NOT NULL DEFAULT '{}',
    additional_tasks JSONB DEFAULT '[]',
    removed_tasks TEXT[] DEFAULT '{}',
    modified_tasks JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    applies_to_job_codes TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for template overrides
ALTER TABLE template_overrides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Managers can manage their template overrides" ON template_overrides FOR ALL USING (
    manager_email = auth.jwt() ->> 'email'
);

-- Template usage tracking
CREATE TABLE template_usage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    template_id UUID REFERENCES templates(id) ON DELETE CASCADE,
    handover_id UUID REFERENCES handovers(id) ON DELETE CASCADE,
    used_by_manager TEXT NOT NULL,
    employee_email TEXT NOT NULL,
    job_code TEXT NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    success_score DECIMAL,
    completion_time_hours DECIMAL,
    tasks_completed INTEGER DEFAULT 0,
    tasks_total INTEGER DEFAULT 0,
    notes TEXT
);

-- RLS for template usage
ALTER TABLE template_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Managers can view their team's template usage" ON template_usage FOR SELECT USING (
    used_by_manager = auth.jwt() ->> 'email'
);

-- Department template standards
CREATE TABLE department_standards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    department TEXT NOT NULL,
    plant_location TEXT,
    mandatory_categories TEXT[] NOT NULL,
    mandatory_items JSONB NOT NULL DEFAULT '[]',
    compliance_requirements JSONB DEFAULT '{}',
    cultural_requirements JSONB DEFAULT '{}',
    minimum_completion_time_hours INTEGER,
    created_by TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    UNIQUE(department, plant_location)
);

-- RLS for department standards
ALTER TABLE department_standards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active department standards" ON department_standards FOR SELECT USING (is_active = true);
CREATE POLICY "Managers can create department standards" ON department_standards FOR INSERT WITH CHECK (
    auth.jwt() ->> 'role' IN ('admin', 'manager')
);

-- Template collaboration
CREATE TABLE template_collaborators (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    template_id UUID REFERENCES templates(id) ON DELETE CASCADE,
    collaborator_email TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('viewer', 'editor', 'reviewer', 'owner')),
    invited_by TEXT NOT NULL,
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    accepted_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true
);

-- RLS for template collaborators
ALTER TABLE template_collaborators ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Collaborators can view their collaborations" ON template_collaborators FOR SELECT USING (
    collaborator_email = auth.jwt() ->> 'email'
);

-- Template versions history
CREATE TABLE template_versions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    template_id UUID REFERENCES templates(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    sections JSONB NOT NULL,
    change_description TEXT,
    changed_by TEXT NOT NULL,
    change_type TEXT CHECK (change_type IN ('minor', 'major', 'fix', 'feature')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(template_id, version_number)
);

-- Indexes for performance
CREATE INDEX idx_template_permissions_user_email ON template_permissions(user_email);
CREATE INDEX idx_template_permissions_template_id ON template_permissions(template_id);
CREATE INDEX idx_template_feedback_template_id ON template_feedback(template_id);
CREATE INDEX idx_template_feedback_rating ON template_feedback(rating);
CREATE INDEX idx_template_usage_manager ON template_usage(used_by_manager);
CREATE INDEX idx_template_usage_template_id ON template_usage(template_id);
CREATE INDEX idx_manager_preferences_email ON manager_preferences(manager_email);
CREATE INDEX idx_template_overrides_manager ON template_overrides(manager_email);
CREATE INDEX idx_department_standards_dept ON department_standards(department);

-- Functions for template metrics calculation
CREATE OR REPLACE FUNCTION calculate_template_metrics(template_uuid UUID)
RETURNS void AS $$
DECLARE
    usage_stats RECORD;
    feedback_stats RECORD;
BEGIN
    -- Calculate usage statistics
    SELECT 
        COUNT(*) as usage_count,
        AVG(completion_time_hours) as avg_completion_time,
        AVG(success_score) as avg_success_rating,
        COUNT(*) FILTER (WHERE completed_at IS NOT NULL) * 100.0 / NULLIF(COUNT(*), 0) as completion_rate,
        AVG(EXTRACT(EPOCH FROM (completed_at - started_at)) / 3600 / 24) as avg_days_to_complete
    INTO usage_stats
    FROM template_usage 
    WHERE template_id = template_uuid;
    
    -- Calculate feedback statistics
    SELECT 
        COUNT(*) as feedback_count,
        COUNT(*) FILTER (WHERE would_recommend = true) * 100.0 / NULLIF(COUNT(*), 0) as recommendation_rate
    INTO feedback_stats
    FROM template_feedback 
    WHERE template_id = template_uuid;
    
    -- Update or insert metrics
    INSERT INTO template_metrics (
        template_id, 
        usage_count, 
        avg_completion_time_hours, 
        avg_success_rating,
        completion_rate,
        avg_time_to_complete_days,
        feedback_count,
        recommendation_rate,
        last_calculated
    ) VALUES (
        template_uuid,
        COALESCE(usage_stats.usage_count, 0),
        usage_stats.avg_completion_time,
        usage_stats.avg_success_rating,
        usage_stats.completion_rate,
        usage_stats.avg_days_to_complete,
        COALESCE(feedback_stats.feedback_count, 0),
        feedback_stats.recommendation_rate,
        NOW()
    )
    ON CONFLICT (template_id) 
    DO UPDATE SET
        usage_count = EXCLUDED.usage_count,
        avg_completion_time_hours = EXCLUDED.avg_completion_time_hours,
        avg_success_rating = EXCLUDED.avg_success_rating,
        completion_rate = EXCLUDED.completion_rate,
        avg_time_to_complete_days = EXCLUDED.avg_time_to_complete_days,
        feedback_count = EXCLUDED.feedback_count,
        recommendation_rate = EXCLUDED.recommendation_rate,
        last_calculated = NOW(),
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Trigger to update template metrics when handovers complete
CREATE OR REPLACE FUNCTION update_template_metrics_on_handover_change()
RETURNS TRIGGER AS $$
BEGIN
    -- When handover status changes to completed or approved
    IF (NEW.status IN ('completed', 'approved') AND OLD.status != NEW.status) THEN
        PERFORM calculate_template_metrics(NEW.template_id);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_template_metrics
    AFTER UPDATE ON handovers
    FOR EACH ROW
    EXECUTE FUNCTION update_template_metrics_on_handover_change();

-- Function to get effective template for a handover (with overrides)
CREATE OR REPLACE FUNCTION get_effective_template(
    template_uuid UUID,
    manager_email_param TEXT,
    job_code_param TEXT
) RETURNS JSONB AS $$
DECLARE
    base_template RECORD;
    override_template RECORD;
    effective_sections JSONB;
BEGIN
    -- Get base template
    SELECT sections INTO base_template FROM templates WHERE id = template_uuid;
    
    -- Check for manager override
    SELECT custom_sections, additional_tasks, removed_tasks, modified_tasks
    INTO override_template
    FROM template_overrides 
    WHERE base_template_id = template_uuid 
    AND manager_email = manager_email_param
    AND is_active = true
    AND (applies_to_job_codes IS NULL OR job_code_param = ANY(applies_to_job_codes))
    ORDER BY updated_at DESC
    LIMIT 1;
    
    -- Start with base template
    effective_sections := base_template.sections;
    
    -- Apply overrides if they exist
    IF override_template IS NOT NULL THEN
        -- Merge custom sections
        IF override_template.custom_sections IS NOT NULL THEN
            effective_sections := effective_sections || override_template.custom_sections;
        END IF;
        
        -- Add additional tasks (this would need more complex logic in real implementation)
        -- Remove unnecessary tasks
        -- Modify existing tasks
    END IF;
    
    RETURN effective_sections;
END;
$$ LANGUAGE plpgsql;

-- Create audit log trigger for new tables
CREATE TRIGGER audit_template_permissions 
AFTER INSERT OR UPDATE OR DELETE ON template_permissions
FOR EACH ROW EXECUTE FUNCTION handle_audit_log();

CREATE TRIGGER audit_template_feedback 
AFTER INSERT OR UPDATE OR DELETE ON template_feedback
FOR EACH ROW EXECUTE FUNCTION handle_audit_log();

CREATE TRIGGER audit_manager_preferences 
AFTER INSERT OR UPDATE OR DELETE ON manager_preferences
FOR EACH ROW EXECUTE FUNCTION handle_audit_log();

-- Insert default department standards for Albaad
INSERT INTO department_standards (department, mandatory_categories, mandatory_items, compliance_requirements, created_by) VALUES 
('Production', 
 ARRAY['safety_procedures', 'quality_control', 'equipment_handover'], 
 '[
    {"category": "safety_procedures", "title": "Safety Protocol Documentation", "required": true},
    {"category": "quality_control", "title": "QC Checklist and Procedures", "required": true},
    {"category": "equipment_handover", "title": "Machine Operation Manuals", "required": true}
 ]'::jsonb,
 '{"iso_9001": true, "fda_compliance": true, "safety_training": true}'::jsonb,
 'system'
),
('Quality Assurance',
 ARRAY['compliance_docs', 'test_procedures', 'certification_records'],
 '[
    {"category": "compliance_docs", "title": "Regulatory Compliance Files", "required": true},
    {"category": "test_procedures", "title": "Testing Protocols and Results", "required": true},
    {"category": "certification_records", "title": "Product Certifications", "required": true}
 ]'::jsonb,
 '{"iso_standards": true, "oeko_tex": true, "lab_certification": true}'::jsonb,
 'system'
),
('Human Resources',
 ARRAY['employee_records', 'policies', 'compliance'],
 '[
    {"category": "employee_records", "title": "Personnel Files Access", "required": true},
    {"category": "policies", "title": "HR Policies and Procedures", "required": true},
    {"category": "compliance", "title": "Labor Law Compliance Records", "required": true}
 ]'::jsonb,
 '{"gdpr_compliance": true, "labor_laws": true, "data_protection": true}'::jsonb,
 'system'
);

-- Grant permissions
GRANT SELECT ON template_permissions TO authenticated;
GRANT SELECT ON template_feedback TO authenticated;
GRANT SELECT ON template_metrics TO authenticated;
GRANT SELECT ON manager_preferences TO authenticated;
GRANT SELECT ON template_overrides TO authenticated;
GRANT SELECT ON template_usage TO authenticated;
GRANT SELECT ON department_standards TO authenticated;
GRANT SELECT ON template_collaborators TO authenticated;
GRANT SELECT ON template_versions TO authenticated;

-- Comments for documentation
COMMENT ON TABLE template_permissions IS 'Controls who can access and modify templates';
COMMENT ON TABLE template_feedback IS 'Collects feedback from users to improve templates';
COMMENT ON TABLE template_metrics IS 'Tracks template effectiveness and usage statistics';
COMMENT ON TABLE manager_preferences IS 'Stores manager-specific settings and preferences';
COMMENT ON TABLE template_overrides IS 'Allows managers to customize templates for their teams';
COMMENT ON TABLE template_usage IS 'Tracks how templates are used in real handovers';
COMMENT ON TABLE department_standards IS 'Defines mandatory requirements per department';
COMMENT ON TABLE template_collaborators IS 'Manages template sharing and collaboration';
COMMENT ON TABLE template_versions IS 'Maintains version history of template changes';