-- Google Integration Schema Updates
-- This file contains all database changes needed for Google Sheets and Drive integration

-- 1. Create job_roles table with job codes and manager mapping
CREATE TABLE IF NOT EXISTS job_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    job_code TEXT UNIQUE NOT NULL, -- HR001, DEV002, MKT003
    job_title TEXT NOT NULL, -- "מנהל משאבי אנוש", "מפתח בכיר"
    department TEXT NOT NULL,
    manager_email TEXT NOT NULL,
    template_id UUID REFERENCES templates(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policy for job_roles
ALTER TABLE job_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view job roles" ON job_roles FOR SELECT USING (true);
CREATE POLICY "Only admins can modify job roles" ON job_roles FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin'
);

-- 2. Update handovers table to include Google Drive and Google Sheets data
ALTER TABLE handovers ADD COLUMN IF NOT EXISTS employee_name TEXT;
ALTER TABLE handovers ADD COLUMN IF NOT EXISTS job_code TEXT REFERENCES job_roles(job_code);
ALTER TABLE handovers ADD COLUMN IF NOT EXISTS job_title TEXT;
ALTER TABLE handovers ADD COLUMN IF NOT EXISTS departure_date DATE;
ALTER TABLE handovers ADD COLUMN IF NOT EXISTS manager_email TEXT;

-- Google Drive integration fields
ALTER TABLE handovers ADD COLUMN IF NOT EXISTS drive_folder_id TEXT;
ALTER TABLE handovers ADD COLUMN IF NOT EXISTS drive_folder_url TEXT;

-- Additional metadata
ALTER TABLE handovers ADD COLUMN IF NOT EXISTS completion_notes TEXT;
ALTER TABLE handovers ADD COLUMN IF NOT EXISTS approval_notes TEXT;
ALTER TABLE handovers ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Update status enum to include new states
ALTER TABLE handovers DROP CONSTRAINT IF EXISTS handovers_status_check;
ALTER TABLE handovers ADD CONSTRAINT handovers_status_check 
    CHECK (status IN ('created', 'in_progress', 'completed', 'approved', 'rejected', 'needs_revision'));

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_handovers_employee_email ON handovers(employee_email);
CREATE INDEX IF NOT EXISTS idx_handovers_manager_email ON handovers(manager_email);
CREATE INDEX IF NOT EXISTS idx_handovers_job_code ON handovers(job_code);
CREATE INDEX IF NOT EXISTS idx_handovers_departure_date ON handovers(departure_date);

-- 3. Update handover_tasks table for Google Drive file metadata
ALTER TABLE handover_tasks ADD COLUMN IF NOT EXISTS task_id TEXT;
ALTER TABLE handover_tasks ADD COLUMN IF NOT EXISTS instructions TEXT;

-- Google Drive file details
ALTER TABLE handover_tasks ADD COLUMN IF NOT EXISTS drive_file_id TEXT;
ALTER TABLE handover_tasks ADD COLUMN IF NOT EXISTS drive_file_name TEXT;
ALTER TABLE handover_tasks ADD COLUMN IF NOT EXISTS drive_file_url TEXT; -- shareable link
ALTER TABLE handover_tasks ADD COLUMN IF NOT EXISTS drive_file_size BIGINT; -- bytes
ALTER TABLE handover_tasks ADD COLUMN IF NOT EXISTS drive_file_type TEXT; -- mime type

-- 4. Create sheets_sync_log table for tracking Google Sheets synchronization
CREATE TABLE IF NOT EXISTS sheets_sync_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sync_started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sync_completed_at TIMESTAMP WITH TIME ZONE,
    rows_processed INTEGER DEFAULT 0,
    handovers_created INTEGER DEFAULT 0,
    errors_count INTEGER DEFAULT 0,
    error_details JSONB,
    status TEXT DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed'))
);

-- RLS Policy for sheets_sync_log
ALTER TABLE sheets_sync_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Only admins can view sync logs" ON sheets_sync_log FOR SELECT USING (
    auth.jwt() ->> 'role' = 'admin'
);

-- 5. Update templates table to support job codes array
ALTER TABLE templates ADD COLUMN IF NOT EXISTS job_codes TEXT[] DEFAULT '{}';

-- Update RLS policies for the new fields
CREATE POLICY "Users can view own handovers by email" ON handovers FOR SELECT USING (
    auth.jwt() ->> 'email' = employee_email
);

CREATE POLICY "Managers can view team handovers by email" ON handovers FOR SELECT USING (
    auth.jwt() ->> 'email' = manager_email
);

CREATE POLICY "Users can update own handovers when in progress" ON handovers FOR UPDATE USING (
    auth.jwt() ->> 'email' = employee_email AND status IN ('created', 'in_progress', 'needs_revision')
);

CREATE POLICY "Managers can approve completed handovers" ON handovers FOR UPDATE USING (
    auth.jwt() ->> 'email' = manager_email AND status = 'completed'
);

-- 6. Insert sample job roles data
INSERT INTO job_roles (job_code, job_title, department, manager_email, template_id) VALUES
('HR001', 'מנהל משאבי אנוש', 'משאבי אנוש', 'hr.manager@company.com', (SELECT id FROM templates WHERE name LIKE '%HR%' LIMIT 1)),
('DEV002', 'מפתח בכיר', 'פיתוח', 'dev.manager@company.com', (SELECT id FROM templates WHERE name LIKE '%Developer%' OR name LIKE '%פיתוח%' LIMIT 1)),
('MKT003', 'מנהל שיווק', 'שיווק', 'marketing.manager@company.com', (SELECT id FROM templates WHERE name LIKE '%Marketing%' OR name LIKE '%שיווק%' LIMIT 1)),
('FIN004', 'רואה חשבון', 'כספים', 'finance.manager@company.com', (SELECT id FROM templates WHERE name LIKE '%Finance%' OR name LIKE '%כספים%' LIMIT 1)),
('IT005', 'מנהל מערכות מידע', 'מערכות מידע', 'it.manager@company.com', (SELECT id FROM templates WHERE name LIKE '%IT%' OR name LIKE '%מערכות%' LIMIT 1))
ON CONFLICT (job_code) DO NOTHING;

-- 7. Create function to automatically create Google Drive folder structure
CREATE OR REPLACE FUNCTION create_handover_drive_structure(
    handover_id UUID,
    employee_name TEXT,
    job_title TEXT
) RETURNS TEXT AS $$
DECLARE
    folder_name TEXT;
BEGIN
    -- Generate folder name
    folder_name := employee_name || ' - ' || job_title || ' - חפיפה';
    
    -- This would typically call external API, but we'll handle it in the application layer
    -- Return the expected folder name for now
    RETURN folder_name;
END;
$$ LANGUAGE plpgsql;

-- 8. Create trigger to update handover timestamps
CREATE OR REPLACE FUNCTION update_handover_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    
    -- Set specific timestamps based on status changes
    IF NEW.status = 'in_progress' AND OLD.status = 'created' THEN
        NEW.started_at = NOW();
    ELSIF NEW.status = 'completed' AND OLD.status = 'in_progress' THEN
        NEW.completed_at = NOW();
    ELSIF NEW.status = 'approved' AND OLD.status = 'completed' THEN
        NEW.approved_at = NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_handover_timestamp
    BEFORE UPDATE ON handovers
    FOR EACH ROW EXECUTE FUNCTION update_handover_timestamp();

-- 9. Create view for handover summary with Google integration
CREATE OR REPLACE VIEW handover_summary AS
SELECT 
    h.id,
    h.employee_name,
    h.employee_email,
    h.job_code,
    h.job_title,
    h.departure_date,
    h.manager_email,
    h.status,
    h.drive_folder_url,
    h.created_at,
    h.started_at,
    h.completed_at,
    h.approved_at,
    jr.department,
    t.name as template_name,
    COUNT(ht.id) as total_tasks,
    COUNT(CASE WHEN ht.is_completed = true THEN 1 END) as completed_tasks,
    ROUND(
        (COUNT(CASE WHEN ht.is_completed = true THEN 1 END)::float / 
         GREATEST(COUNT(ht.id), 1) * 100), 0
    ) as progress_percentage
FROM handovers h
LEFT JOIN job_roles jr ON h.job_code = jr.job_code
LEFT JOIN templates t ON h.template_id = t.id  
LEFT JOIN handover_tasks ht ON h.id = ht.handover_id
GROUP BY h.id, jr.department, t.name;

-- Grant permissions on the view
GRANT SELECT ON handover_summary TO anon, authenticated;

-- Enable RLS on the view (inherits from base tables)
ALTER VIEW handover_summary SET (security_invoker = true);

COMMENT ON TABLE job_roles IS 'Maps job codes to templates and managers for automated handover creation';
COMMENT ON TABLE sheets_sync_log IS 'Tracks Google Sheets synchronization runs and results';
COMMENT ON COLUMN handovers.drive_folder_id IS 'Google Drive folder ID for handover files';
COMMENT ON COLUMN handovers.drive_folder_url IS 'Shareable URL to Google Drive folder';
COMMENT ON COLUMN handover_tasks.drive_file_id IS 'Google Drive file ID';
COMMENT ON COLUMN handover_tasks.drive_file_url IS 'Shareable URL to Google Drive file';