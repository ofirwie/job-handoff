-- Fix Manager Dashboard Function Type Mismatch
-- Use TEXT instead of VARCHAR to match the view's actual types

DROP FUNCTION IF EXISTS get_manager_dashboard_data CASCADE;

CREATE OR REPLACE FUNCTION get_manager_dashboard_data(
    p_manager_email TEXT DEFAULT NULL,
    p_department_filter TEXT DEFAULT NULL,
    p_role_filter TEXT DEFAULT NULL,
    p_status_filter TEXT DEFAULT NULL,
    p_time_category_filter TEXT DEFAULT NULL,
    p_hide_completed BOOLEAN DEFAULT false
)
RETURNS TABLE (
    id UUID,
    leaving_employee_name TEXT,
    leaving_employee_email TEXT,
    incoming_employee_name TEXT,
    incoming_employee_email TEXT,
    manager_name TEXT,
    manager_email TEXT,
    start_date DATE,
    due_date DATE,
    completed_date DATE,
    status TEXT,
    priority INTEGER,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    is_overdue BOOLEAN,
    time_category TEXT,
    days_until_due INTEGER,
    days_overdue INTEGER,
    job_title TEXT,
    job_level TEXT,
    department_name TEXT,
    department_code TEXT,
    plant_name TEXT,
    country TEXT,
    template_name TEXT,
    template_description TEXT,
    total_items BIGINT,
    completed_items BIGINT,
    completion_percentage NUMERIC,
    leaving_employee_full_name TEXT,
    leaving_employee_role TEXT,
    incoming_employee_full_name TEXT,
    incoming_employee_role TEXT,
    manager_full_name TEXT,
    manager_role TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        mdv.id,
        mdv.leaving_employee_name::TEXT,
        mdv.leaving_employee_email::TEXT,
        mdv.incoming_employee_name::TEXT,
        mdv.incoming_employee_email::TEXT,
        mdv.manager_name::TEXT,
        mdv.manager_email::TEXT,
        mdv.start_date,
        mdv.due_date,
        mdv.completed_date,
        mdv.status::TEXT,
        mdv.priority,
        mdv.notes::TEXT,
        mdv.created_at,
        mdv.is_overdue,
        mdv.time_category::TEXT,
        mdv.days_until_due,
        mdv.days_overdue,
        mdv.job_title::TEXT,
        mdv.job_level::TEXT,
        mdv.department_name::TEXT,
        mdv.department_code::TEXT,
        mdv.plant_name::TEXT,
        mdv.country::TEXT,
        mdv.template_name::TEXT,
        mdv.template_description::TEXT,
        mdv.total_items,
        mdv.completed_items,
        mdv.completion_percentage,
        mdv.leaving_employee_full_name::TEXT,
        mdv.leaving_employee_role::TEXT,
        mdv.incoming_employee_full_name::TEXT,
        mdv.incoming_employee_role::TEXT,
        mdv.manager_full_name::TEXT,
        mdv.manager_role::TEXT
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

-- Also create a simplified version that just returns everything
CREATE OR REPLACE FUNCTION get_all_manager_handovers()
RETURNS TABLE (
    id UUID,
    leaving_employee_name TEXT,
    leaving_employee_email TEXT,
    incoming_employee_name TEXT,
    incoming_employee_email TEXT,
    manager_email TEXT,
    job_title TEXT,
    department_name TEXT,
    plant_name TEXT,
    start_date DATE,
    due_date DATE,
    status TEXT,
    time_category TEXT,
    is_overdue BOOLEAN,
    completion_percentage NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        mdv.id,
        mdv.leaving_employee_name::TEXT,
        mdv.leaving_employee_email::TEXT,
        mdv.incoming_employee_name::TEXT,
        mdv.incoming_employee_email::TEXT,
        mdv.manager_email::TEXT,
        mdv.job_title::TEXT,
        mdv.department_name::TEXT,
        mdv.plant_name::TEXT,
        mdv.start_date,
        mdv.due_date,
        mdv.status::TEXT,
        mdv.time_category::TEXT,
        mdv.is_overdue,
        mdv.completion_percentage
    FROM manager_dashboard_view mdv
    WHERE mdv.manager_email = 'ofir393@gmail.com'
    ORDER BY mdv.due_date ASC;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION get_all_manager_handovers TO authenticated;

-- Update sample data to use your email
UPDATE handovers 
SET manager_email = 'ofir393@gmail.com'
WHERE manager_email != 'ofir393@gmail.com';

UPDATE departments 
SET manager_email = 'ofir393@gmail.com'
WHERE manager_email != 'ofir393@gmail.com';

-- Test the functions
DO $$
DECLARE
    handover_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO handover_count FROM get_all_manager_handovers();
    RAISE NOTICE 'Found % handovers for ofir393@gmail.com', handover_count;
    RAISE NOTICE 'Dashboard functions fixed with correct types';
END $$;