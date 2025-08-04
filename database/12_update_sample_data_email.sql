-- Update sample data to use working email
-- Run this after user creation

-- Update handovers to use the test email
UPDATE handovers 
SET manager_email = 'test@example.com'
WHERE manager_email = 'john.manager@ofir.ai';

-- Update departments to use the test email  
UPDATE departments 
SET manager_email = 'test@example.com'
WHERE manager_email = 'john.manager@ofir.ai';

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Sample data updated to use test@example.com';
END $$;