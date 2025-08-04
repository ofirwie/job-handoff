-- Manager Dashboard Database Enhancements - FIXED VERSION
-- Removes generated columns and uses views/functions for real-time calculations

-- 1. Update handovers status to include new manager workflow states
ALTER TABLE handovers 
DROP CONSTRAINT IF EXISTS handovers_status_check;

ALTER TABLE handovers 
ADD CONSTRAINT handovers_status_check 
CHECK (status IN ('created', 'in_progress', 'completed', 'cancelled', 'overdue', 'pending_review', 'approved', 'rejected'));

-- 2. Add priority field (regular column, not computed)
ALTER TABLE handovers 
ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 3 CHECK (priority BETWEEN 1 AND 5);

-- 3. Create manager dashboard view with real-time calculations
CREATE OR REPLACE VIEW manager_dashboard_view AS
SELECT 
    h.id,
    h.leaving_employee_name,
    h.leaving_employee_email,
    h.incoming_employee_name,
    h.incoming_employee_email,
    h.manager_name,
    h.manager_email,
    h.start_date,
    h.due_date,
    h.completed_date,
    h.status,
    h.priority,
    h.notes,
    h.created_at,
    
    -- Real-time calculated fields
    CASE 
        WHEN h.status IN ('completed', 'cancelled', 'approved', 'rejected') THEN false
        WHEN h.due_date < CURRENT_DATE THEN true
        ELSE false
    END as is_overdue,
    
    CASE 
        WHEN h.status IN ('completed', 'cancelled', 'approved', 'rejected') THEN 'completed'
        WHEN h.due_date < CURRENT_DATE THEN 'overdue'
        WHEN h.due_date = CURRENT_DATE THEN 'today'
        WHEN h.due_date BETWEEN CURRENT_DATE + 1 AND CURRENT_DATE + 7 THEN 'this_week'
        WHEN h.due_date BETWEEN CURRENT_DATE + 8 AND CURRENT_DATE + 14 THEN 'next_week'
        ELSE 'future'
    END as time_category,
    
    -- Days calculations
    CASE 
        WHEN h.due_date >= CURRENT_DATE 
        THEN h.due_date - CURRENT_DATE
        ELSE 0
    END as days_until_due,
    
    CASE 
        WHEN h.due_date < CURRENT_DATE AND h.status NOT IN ('completed', 'cancelled', 'approved', 'rejected')
        THEN CURRENT_DATE - h.due_date
        ELSE 0
    END as days_overdue,
    
    -- Job and Department Information
    j.title as job_title,
    j.level as job_level,
    d.name as department_name,
    d.code as department_code,
    p.name as plant_name,
    p.country,
    
    -- Template Information
    t.name as template_name,
    t.description as template_description,
    
    -- Progress Calculation
    COALESCE(progress_stats.total_items, 0) as total_items,
    COALESCE(progress_stats.completed_items, 0) as completed_items,
    CASE 
        WHEN COALESCE(progress_stats.total_items, 0) = 0 THEN 0
        ELSE ROUND((COALESCE(progress_stats.completed_items, 0)::DECIMAL / progress_stats.total_items) * 100, 1)
    END as completion_percentage,
    
    -- Team Information
    up_leaving.full_name as leaving_employee_full_name,
    up_leaving.role as leaving_employee_role,
    up_incoming.full_name as incoming_employee_full_name,
    up_incoming.role as incoming_employee_role,
    up_manager.full_name as manager_full_name,
    up_manager.role as manager_role

FROM handovers h
LEFT JOIN jobs j ON h.job_id = j.id
LEFT JOIN departments d ON j.department_id = d.id
LEFT JOIN plants p ON d.plant_id = p.id
LEFT JOIN templates t ON h.template_id = t.id
LEFT JOIN user_profiles up_leaving ON h.leaving_employee_email = up_leaving.email
LEFT JOIN user_profiles up_incoming ON h.incoming_employee_email = up_incoming.email
LEFT JOIN user_profiles up_manager ON h.manager_email = up_manager.email
LEFT JOIN (
    SELECT 
        hp.handover_id,
        COUNT(*) as total_items,
        SUM(CASE WHEN hp.status = 'completed' THEN 1 ELSE 0 END) as completed_items
    FROM handover_progress hp
    GROUP BY hp.handover_id
) progress_stats ON h.id = progress_stats.handover_id;

-- 4. Create function to get manager dashboard data with filtering
CREATE OR REPLACE FUNCTION get_manager_dashboard_data(
    p_manager_email VARCHAR(255) DEFAULT NULL,
    p_department_filter VARCHAR(200) DEFAULT NULL,
    p_role_filter VARCHAR(50) DEFAULT NULL,
    p_status_filter VARCHAR(20) DEFAULT NULL,
    p_time_category_filter VARCHAR(20) DEFAULT NULL,
    p_hide_completed BOOLEAN DEFAULT false
)
RETURNS TABLE (
    id UUID,
    leaving_employee_name VARCHAR(200),
    leaving_employee_email VARCHAR(255),
    incoming_employee_name VARCHAR(200),
    incoming_employee_email VARCHAR(255),
    job_title VARCHAR(200),
    job_level VARCHAR(50),
    department_name VARCHAR(200),
    department_code VARCHAR(10),
    plant_name VARCHAR(200),
    country VARCHAR(100),
    start_date DATE,
    due_date DATE,
    completed_date DATE,
    status VARCHAR(20),
    is_overdue BOOLEAN,
    time_category VARCHAR(20),
    priority INTEGER,
    completion_percentage DECIMAL,
    total_items BIGINT,
    completed_items BIGINT,
    days_until_due INTEGER,
    days_overdue INTEGER,
    template_name VARCHAR(200),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
    status_priority_order TEXT[];
BEGIN
    -- Define status priority order (lower index = higher priority)
    status_priority_order := ARRAY['overdue', 'pending_review', 'in_progress', 'created', 'approved', 'completed', 'cancelled', 'rejected'];

    RETURN QUERY
    SELECT 
        mdv.id,
        mdv.leaving_employee_name,
        mdv.leaving_employee_email,
        mdv.incoming_employee_name,
        mdv.incoming_employee_email,
        mdv.job_title,
        mdv.job_level,
        mdv.department_name,
        mdv.department_code,
        mdv.plant_name,
        mdv.country,
        mdv.start_date,
        mdv.due_date,
        mdv.completed_date,
        mdv.status,
        mdv.is_overdue,
        mdv.time_category,
        mdv.priority,
        mdv.completion_percentage,
        mdv.total_items,
        mdv.completed_items,
        mdv.days_until_due,
        mdv.days_overdue,
        mdv.template_name,
        mdv.notes,
        mdv.created_at
    FROM manager_dashboard_view mdv
    WHERE (p_manager_email IS NULL OR mdv.manager_email = p_manager_email)
      AND (p_department_filter IS NULL OR mdv.department_name = p_department_filter)
      AND (p_role_filter IS NULL OR mdv.job_level = p_role_filter)
      AND (p_status_filter IS NULL OR mdv.status = p_status_filter)
      AND (p_time_category_filter IS NULL OR mdv.time_category = p_time_category_filter)
      AND (NOT p_hide_completed OR mdv.status NOT IN ('completed', 'cancelled', 'approved'))
    ORDER BY 
        -- Custom status priority order
        array_position(status_priority_order, mdv.status) NULLS LAST,
        mdv.priority,
        mdv.due_date ASC;
END;
$$ LANGUAGE plpgsql;

-- 5. Create KPI aggregation function for manager dashboard
CREATE OR REPLACE FUNCTION get_manager_dashboard_kpis(
    p_manager_email VARCHAR(255) DEFAULT NULL
)
RETURNS TABLE (
    total_handovers BIGINT,
    overdue_count BIGINT,
    today_count BIGINT,
    this_week_count BIGINT,
    next_week_count BIGINT,
    pending_review_count BIGINT,
    completed_count BIGINT,
    average_completion_percentage DECIMAL,
    total_departments BIGINT,
    active_employees BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_handovers,
        SUM(CASE WHEN mdv.time_category = 'overdue' THEN 1 ELSE 0 END)::BIGINT as overdue_count,
        SUM(CASE WHEN mdv.time_category = 'today' THEN 1 ELSE 0 END)::BIGINT as today_count,
        SUM(CASE WHEN mdv.time_category = 'this_week' THEN 1 ELSE 0 END)::BIGINT as this_week_count,
        SUM(CASE WHEN mdv.time_category = 'next_week' THEN 1 ELSE 0 END)::BIGINT as next_week_count,
        SUM(CASE WHEN mdv.status = 'pending_review' THEN 1 ELSE 0 END)::BIGINT as pending_review_count,
        SUM(CASE WHEN mdv.status IN ('completed', 'approved') THEN 1 ELSE 0 END)::BIGINT as completed_count,
        COALESCE(AVG(mdv.completion_percentage), 0) as average_completion_percentage,
        COUNT(DISTINCT mdv.department_name)::BIGINT as total_departments,
        COUNT(DISTINCT mdv.leaving_employee_email)::BIGINT as active_employees
    FROM manager_dashboard_view mdv
    WHERE (p_manager_email IS NULL OR mdv.manager_email = p_manager_email);
END;
$$ LANGUAGE plpgsql;

-- 6. Create function to update handover status (for managers)
CREATE OR REPLACE FUNCTION update_handover_status(
    p_handover_id UUID,
    p_new_status VARCHAR(20),
    p_notes TEXT DEFAULT NULL,
    p_manager_email VARCHAR(255) DEFAULT NULL
)
RETURNS TABLE (
    success BOOLEAN,
    message TEXT,
    updated_handover JSONB
) AS $$
DECLARE
    handover_record RECORD;
    valid_statuses TEXT[] := ARRAY['created', 'in_progress', 'completed', 'cancelled', 'overdue', 'pending_review', 'approved', 'rejected'];
BEGIN
    -- Validate status
    IF p_new_status != ALL(valid_statuses) THEN
        RETURN QUERY SELECT false, 'Invalid status value', NULL::JSONB;
        RETURN;
    END IF;

    -- Get current handover and verify manager access
    SELECT * INTO handover_record FROM handovers WHERE id = p_handover_id;
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT false, 'Handover not found', NULL::JSONB;
        RETURN;
    END IF;

    -- Verify manager access (if manager_email provided)
    IF p_manager_email IS NOT NULL AND handover_record.manager_email != p_manager_email THEN
        RETURN QUERY SELECT false, 'Access denied - not your handover', NULL::JSONB;
        RETURN;
    END IF;

    -- Update the handover
    UPDATE handovers 
    SET 
        status = p_new_status,
        notes = CASE WHEN p_notes IS NOT NULL THEN p_notes ELSE notes END,
        completed_date = CASE WHEN p_new_status IN ('completed', 'approved') THEN CURRENT_DATE ELSE completed_date END
    WHERE id = p_handover_id;

    -- Return success with updated record
    SELECT row_to_json(h.*) INTO handover_record FROM handovers h WHERE h.id = p_handover_id;
    
    RETURN QUERY SELECT true, 'Status updated successfully', to_jsonb(handover_record);
END;
$$ LANGUAGE plpgsql;

-- 7. Create indexes for optimal performance
CREATE INDEX IF NOT EXISTS idx_handovers_manager_email ON handovers(manager_email);
CREATE INDEX IF NOT EXISTS idx_handovers_priority ON handovers(priority);
CREATE INDEX IF NOT EXISTS idx_handovers_due_date ON handovers(due_date);
CREATE INDEX IF NOT EXISTS idx_handovers_status_due_date ON handovers(status, due_date);
CREATE INDEX IF NOT EXISTS idx_jobs_level ON jobs(level);
CREATE INDEX IF NOT EXISTS idx_departments_name ON departments(name);
CREATE INDEX IF NOT EXISTS idx_plants_name ON plants(name);

-- 8. Update RLS policies for manager dashboard access
DROP POLICY IF EXISTS manager_dashboard_access ON handovers;
CREATE POLICY manager_dashboard_access ON handovers
    FOR SELECT
    USING (
        manager_email = (auth.jwt() ->> 'email') OR
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.id = auth.uid() 
            AND up.role IN ('admin', 'hr')
        )
    );

-- 9. Create function to automatically update overdue status (can be called by cron)
CREATE OR REPLACE FUNCTION update_overdue_handovers()
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    UPDATE handovers 
    SET status = 'overdue'
    WHERE due_date < CURRENT_DATE 
      AND status IN ('created', 'in_progress')
      AND status != 'overdue';
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT SELECT ON manager_dashboard_view TO authenticated;
GRANT EXECUTE ON FUNCTION get_manager_dashboard_data TO authenticated;
GRANT EXECUTE ON FUNCTION get_manager_dashboard_kpis TO authenticated;
GRANT EXECUTE ON FUNCTION update_handover_status TO authenticated;
GRANT EXECUTE ON FUNCTION update_overdue_handovers TO authenticated;