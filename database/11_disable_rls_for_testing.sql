-- TEMPORARY: Disable RLS for Testing
-- WARNING: This removes security - only use for testing!
-- Remember to re-enable RLS policies for production!

-- Disable RLS on user_profiles temporarily
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- Disable RLS on handovers temporarily  
ALTER TABLE handovers DISABLE ROW LEVEL SECURITY;

-- Disable RLS on other tables temporarily
ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;
ALTER TABLE plants DISABLE ROW LEVEL SECURITY;
ALTER TABLE departments DISABLE ROW LEVEL SECURITY;
ALTER TABLE jobs DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE item_types DISABLE ROW LEVEL SECURITY;
ALTER TABLE base_templates DISABLE ROW LEVEL SECURITY;
ALTER TABLE templates DISABLE ROW LEVEL SECURITY;
ALTER TABLE template_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE handover_progress DISABLE ROW LEVEL SECURITY;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'RLS disabled for testing. Remember to re-enable for production!';
END $$;