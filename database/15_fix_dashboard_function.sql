-- Fix Manager Dashboard Function Return Type
-- The function needs to match all columns from the view

DROP FUNCTION IF EXISTS get_manager_dashboard_data CASCADE;

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
    manager_name VARCHAR(200),
    manager_email VARCHAR(255),
    start_date DATE,
    due_date DATE,
    completed_date DATE,
    status VARCHAR(20),
    priority INTEGER,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    is_overdue BOOLEAN,
    time_category VARCHAR(20),
    days_until_due INTEGER,
    days_overdue INTEGER,
    job_title VARCHAR(200),
    job_level VARCHAR(50),
    department_name VARCHAR(200),
    department_code VARCHAR(10),
    plant_name VARCHAR(200),
    country VARCHAR(100),
    template_name VARCHAR(200),
    template_description TEXT,
    total_items BIGINT,
    completed_items BIGINT,
    completion_percentage DECIMAL,
    leaving_employee_full_name VARCHAR(255),
    leaving_employee_role VARCHAR(50),
    incoming_employee_full_name VARCHAR(255),
    incoming_employee_role VARCHAR(50),
    manager_full_name VARCHAR(255),
    manager_role VARCHAR(50)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        mdv.id,
        mdv.leaving_employee_name,
        mdv.leaving_employee_email,
        mdv.incoming_employee_name,
        mdv.incoming_employee_email,
        mdv.manager_name,
        mdv.manager_email,
        mdv.start_date,
        mdv.due_date,
        mdv.completed_date,
        mdv.status,
        mdv.priority,
        mdv.notes,
        mdv.created_at,
        mdv.is_overdue,
        mdv.time_category,
        mdv.days_until_due,
        mdv.days_overdue,
        mdv.job_title,
        mdv.job_level,
        mdv.department_name,
        mdv.department_code,
        mdv.plant_name,
        mdv.country,
        mdv.template_name,
        mdv.template_description,
        mdv.total_items,
        mdv.completed_items,
        mdv.completion_percentage,
        mdv.leaving_employee_full_name,
        mdv.leaving_employee_role,
        mdv.incoming_employee_full_name,
        mdv.incoming_employee_role,
        mdv.manager_full_name,
        mdv.manager_role
    FROM manager_dashboard_view mdv
    WHERE 
        (p_manager_email IS NULL OR mdv.manager_email = p_manager_email)
        AND (p_department_filter IS NULL OR mdv.department_name = p_department_filter)
        AND (p_role_filter IS NULL OR mdv.job_level = p_role_filter)
        AND (p_status_filter IS NULL OR mdv.status = p_status_filter)
        AND (p_time_category_filter IS NULL OR mdv.time_category = p_time_category_filter)
        AND (NOT p_hide_completed OR mdv.status NOT IN ('completed', 'cancelled', 'approved', 'rejected'))
    ORDER BY 
        -- Priority ordering: overdue first, then by due date
        CASE 
            WHEN mdv.is_overdue THEN 0
            WHEN mdv.time_category = 'today' THEN 1
            WHEN mdv.time_category = 'this_week' THEN 2
            WHEN mdv.time_category = 'next_week' THEN 3
            ELSE 4
        END,
        mdv.due_date ASC,
        mdv.priority ASC;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_manager_dashboard_data TO authenticated;

-- Also update sample data to use your email
UPDATE handovers 
SET manager_email = 'ofir393@gmail.com'
WHERE manager_email IN ('john.manager@ofir.ai', 'test@example.com', 'manager@company.com', 'testuser@gmail.com');

UPDATE departments 
SET manager_email = 'ofir393@gmail.com'
WHERE manager_email IN ('john.manager@ofir.ai', 'test@example.com', 'manager@company.com', 'testuser@gmail.com');

-- Verify the function works
SELECT COUNT(*) as handover_count FROM get_manager_dashboard_data('ofir393@gmail.com');

DO $$
BEGIN
  RAISE NOTICE 'Dashboard function fixed and sample data updated for ofir393@gmail.com';
END $$;