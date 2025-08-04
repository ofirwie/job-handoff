-- Debug and Fix User Status for test@example.com
-- Run this in Supabase SQL Editor to diagnose and fix login issues

-- Step 1: Check if user exists in auth.users
SELECT 
    id, 
    email, 
    email_confirmed_at,
    created_at,
    updated_at,
    last_sign_in_at,
    raw_user_meta_data
FROM auth.users 
WHERE email = 'test@example.com';

-- Step 2: Check if user profile exists
SELECT * FROM user_profiles WHERE email = 'test@example.com';

-- Step 3: If user exists but email_confirmed_at is NULL, confirm the user
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email = 'test@example.com' 
AND email_confirmed_at IS NULL;

-- Step 4: If user exists but no profile, create one
-- First, get the user ID
DO $$
DECLARE
    user_uuid UUID;
BEGIN
    -- Get the user ID
    SELECT id INTO user_uuid FROM auth.users WHERE email = 'test@example.com';
    
    IF user_uuid IS NOT NULL THEN
        -- Insert or update user profile
        INSERT INTO user_profiles (
            id, 
            email, 
            full_name, 
            role, 
            plant_id, 
            department_id,
            created_at,
            updated_at
        ) VALUES (
            user_uuid,
            'test@example.com',
            'Test Manager',
            'manager',
            '223e4567-e89b-12d3-a456-426614174000',
            '423e4567-e89b-12d3-a456-426614174000',
            NOW(),
            NOW()
        ) ON CONFLICT (id) DO UPDATE SET 
            role = 'manager',
            full_name = 'Test Manager',
            plant_id = '223e4567-e89b-12d3-a456-426614174000',
            department_id = '423e4567-e89b-12d3-a456-426614174000',
            updated_at = NOW();
            
        RAISE NOTICE 'User profile created/updated for test@example.com with ID: %', user_uuid;
    ELSE
        RAISE NOTICE 'User test@example.com not found in auth.users table';
    END IF;
END $$;

-- Step 5: Verify everything is set up correctly
SELECT 
    u.id,
    u.email,
    u.email_confirmed_at,
    p.full_name,
    p.role,
    p.plant_id,
    p.department_id
FROM auth.users u
LEFT JOIN user_profiles p ON u.id = p.id
WHERE u.email = 'test@example.com';

-- Step 6: If no user found, provide creation instructions
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'test@example.com') THEN
        RAISE NOTICE 'USER NOT FOUND! Please create the user first by:';
        RAISE NOTICE '1. Go to http://localhost:3000/create-user';
        RAISE NOTICE '2. Click "Create User (Signup)"';
        RAISE NOTICE '3. Then run this script again';
    END IF;
END $$;