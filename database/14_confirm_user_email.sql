-- Manually confirm user email for ofir393@gmail.com
-- Run this in Supabase SQL Editor

-- Confirm the user's email
UPDATE auth.users 
SET 
    email_confirmed_at = NOW(),
    raw_user_meta_data = jsonb_set(
        COALESCE(raw_user_meta_data, '{}'::jsonb),
        '{email_verified}',
        'true'
    )
WHERE email = 'ofir393@gmail.com';

-- Verify the update worked
SELECT 
    id,
    email,
    email_confirmed_at,
    raw_user_meta_data->>'email_verified' as email_verified
FROM auth.users 
WHERE email = 'ofir393@gmail.com';

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Email confirmed for ofir393@gmail.com';
END $$;