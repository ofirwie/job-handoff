-- Manager Dashboard Database Enhancements
-- Adds new status values, computed fields, and views for manager dashboard

-- 1. Update handovers status to include new manager workflow states
ALTER TABLE handovers 
DROP CONSTRAINT IF EXISTS handovers_status_check;

ALTER TABLE handovers 
ADD CONSTRAINT handovers_status_check 
CHECK (status IN ('created', 'in_progress', 'completed', 'cancelled', 'overdue', 'pending_review', 'approved', 'rejected'));

-- 2. Add computed fields for overdue detection
ALTER TABLE handovers 
ADD COLUMN is_overdue BOOLEAN GENERATED ALWAYS AS (
    CASE 
        WHEN status IN ('completed', 'cancelled', 'approved', 'rejected') THEN false
        WHEN due_date < CURRENT_DATE THEN true
        ELSE false
    END
) STORED;

-- 3. Add time category computed field for dashboard grouping
ALTER TABLE handovers 
ADD COLUMN time_category VARCHAR(20) GENERATED ALWAYS AS (
    CASE 
        WHEN status IN ('completed', 'cancelled', 'approved', 'rejected') THEN 'completed'
        WHEN due_date < CURRENT_DATE THEN 'overdue'
        WHEN due_date = CURRENT_DATE THEN 'today'
        WHEN due_date BETWEEN CURRENT_DATE + 1 AND CURRENT_DATE + 7 THEN 'this_week'
        WHEN due_date BETWEEN CURRENT_DATE + 8 AND CURRENT_DATE + 14 THEN 'next_week'
        ELSE 'future'
    END
) STORED;

-- 4. Add priority field for manager dashboard sorting
ALTER TABLE handovers 
ADD COLUMN priority INTEGER DEFAULT 3 CHECK (priority BETWEEN 1 AND 5);

-- 5. Create manager dashboard view with all required data
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
    h.is_overdue,
    h.time_category,
    h.priority,
    h.notes,
    h.created_at,
    
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

-- 6. Create manager-specific dashboard view
CREATE OR REPLACE VIEW manager_specific_dashboard AS
SELECT 
    mdv.*,
    -- Days until due
    CASE 
        WHEN mdv.due_date >= CURRENT_DATE 
        THEN mdv.due_date - CURRENT_DATE
        ELSE 0
    END as days_until_due,
    
    -- Days overdue
    CASE 
        WHEN mdv.due_date < CURRENT_DATE AND mdv.status NOT IN ('completed', 'cancelled', 'approved', 'rejected')
        THEN CURRENT_DATE - mdv.due_date
        ELSE 0
    END as days_overdue,
    
    -- Status priority for sorting (lower number = higher priority)
    CASE mdv.status
        WHEN 'overdue' THEN 1
        WHEN 'pending_review' THEN 2
        WHEN 'in_progress' THEN 3
        WHEN 'created' THEN 4
        WHEN 'approved' THEN 5
        WHEN 'completed' THEN 6
        WHEN 'cancelled' THEN 7
        WHEN 'rejected' THEN 8
        ELSE 9
    END as status_priority

FROM manager_dashboard_view mdv;

-- 7. Create function to get manager dashboard data with filtering
CREATE OR REPLACE FUNCTION get_manager_dashboard_data(
    p_manager_email VARCHAR(255),
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
    total_items INTEGER,
    completed_items INTEGER,
    days_until_due INTEGER,
    days_overdue INTEGER,
    template_name VARCHAR(200),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        msd.id,
        msd.leaving_employee_name,
        msd.leaving_employee_email,
        msd.incoming_employee_name,
        msd.incoming_employee_email,
        msd.job_title,
        msd.job_level,
        msd.department_name,
        msd.department_code,
        msd.plant_name,
        msd.country,
        msd.start_date,
        msd.due_date,
        msd.completed_date,
        msd.status,
        msd.is_overdue,
        msd.time_category,
        msd.priority,
        msd.completion_percentage,
        msd.total_items::INTEGER,
        msd.completed_items::INTEGER,
        msd.days_until_due,
        msd.days_overdue,
        msd.template_name,
        msd.notes,
        msd.created_at
    FROM manager_specific_dashboard msd
    WHERE msd.manager_email = p_manager_email
      AND (p_department_filter IS NULL OR msd.department_name = p_department_filter)
      AND (p_role_filter IS NULL OR msd.job_level = p_role_filter)
      AND (p_status_filter IS NULL OR msd.status = p_status_filter)
      AND (p_time_category_filter IS NULL OR msd.time_category = p_time_category_filter)
      AND (NOT p_hide_completed OR msd.status NOT IN ('completed', 'cancelled', 'approved'))
    ORDER BY 
        msd.status_priority,
        msd.priority,
        msd.due_date ASC;
END;
$$ LANGUAGE plpgsql;

-- 8. Create KPI aggregation function for manager dashboard
CREATE OR REPLACE FUNCTION get_manager_dashboard_kpis(
    p_manager_email VARCHAR(255)
)
RETURNS TABLE (
    total_handovers INTEGER,
    overdue_count INTEGER,
    today_count INTEGER,
    this_week_count INTEGER,
    next_week_count INTEGER,
    pending_review_count INTEGER,
    completed_count INTEGER,
    average_completion_percentage DECIMAL,
    total_departments INTEGER,
    active_employees INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_handovers,
        SUM(CASE WHEN msd.time_category = 'overdue' THEN 1 ELSE 0 END)::INTEGER as overdue_count,
        SUM(CASE WHEN msd.time_category = 'today' THEN 1 ELSE 0 END)::INTEGER as today_count,
        SUM(CASE WHEN msd.time_category = 'this_week' THEN 1 ELSE 0 END)::INTEGER as this_week_count,
        SUM(CASE WHEN msd.time_category = 'next_week' THEN 1 ELSE 0 END)::INTEGER as next_week_count,
        SUM(CASE WHEN msd.status = 'pending_review' THEN 1 ELSE 0 END)::INTEGER as pending_review_count,
        SUM(CASE WHEN msd.status IN ('completed', 'approved') THEN 1 ELSE 0 END)::INTEGER as completed_count,
        COALESCE(AVG(msd.completion_percentage), 0) as average_completion_percentage,
        COUNT(DISTINCT msd.department_name)::INTEGER as total_departments,
        COUNT(DISTINCT msd.leaving_employee_email)::INTEGER as active_employees
    FROM manager_specific_dashboard msd
    WHERE msd.manager_email = p_manager_email;
END;
$$ LANGUAGE plpgsql;

-- 9. Create indexes for optimal performance
CREATE INDEX IF NOT EXISTS idx_handovers_manager_email ON handovers(manager_email);
CREATE INDEX IF NOT EXISTS idx_handovers_time_category ON handovers(time_category);
CREATE INDEX IF NOT EXISTS idx_handovers_is_overdue ON handovers(is_overdue);
CREATE INDEX IF NOT EXISTS idx_handovers_priority ON handovers(priority);
CREATE INDEX IF NOT EXISTS idx_handovers_due_date ON handovers(due_date);
CREATE INDEX IF NOT EXISTS idx_handovers_status_due_date ON handovers(status, due_date);

-- 10. Update RLS policies for manager dashboard access
CREATE POLICY manager_dashboard_access ON handovers
    FOR SELECT
    USING (
        manager_email = auth.jwt() ->> 'email' OR
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.id = auth.uid() 
            AND up.role IN ('admin', 'hr')
        )
    );

-- 11. Add trigger to automatically update status to overdue
CREATE OR REPLACE FUNCTION update_overdue_status()
RETURNS TRIGGER AS $$
BEGIN
    -- This function can be called by a scheduled job to update overdue handovers
    UPDATE handovers 
    SET status = 'overdue'
    WHERE due_date < CURRENT_DATE 
      AND status IN ('created', 'in_progress')
      AND status != 'overdue';
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Comment: You can create a scheduled job to run this function daily:
-- SELECT cron.schedule('update-overdue-handovers', '0 1 * * *', 'SELECT update_overdue_status();');