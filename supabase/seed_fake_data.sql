-- ============================================
-- FAKE DATA SEED SCRIPT
-- Replace 'PLACEHOLDER_HANDLE' with the actual Twitter handle
-- Run this in Supabase SQL Editor
-- ============================================

-- Note: You need to have a user ID first. This script creates a demo profile.
-- If the user already exists via OAuth, update instead of insert.

-- The Twitter handle to seed (CHANGE THIS!)
DO $$
DECLARE
    demo_handle TEXT := 'PLACEHOLDER_HANDLE';  -- ← CHANGE THIS TO THE ACTUAL HANDLE
    demo_user_id UUID;
BEGIN
    -- Check if profile exists
    SELECT id INTO demo_user_id FROM profiles WHERE twitter_handle = demo_handle;
    
    IF demo_user_id IS NULL THEN
        RAISE EXCEPTION 'User % not found. They need to sign up first via OAuth.', demo_handle;
    END IF;
    
    -- Update the profile with impressive stats
    UPDATE profiles SET
        input_tokens = 45000000,      -- 45M input
        output_tokens = 55000000,     -- 55M output (total = 100M for ranking)
        cache_read_tokens = 45000000, -- 45M cache read
        cache_write_tokens = 20000000, -- 20M cache write
        last_active = NOW()
    WHERE id = demo_user_id;
    
    RAISE NOTICE 'Updated profile for @% with 100M tokens', demo_handle;
    
    -- Delete any existing usage logs for this user (to start fresh)
    DELETE FROM usage_logs WHERE user_id = demo_user_id;
    
    -- Insert fake hourly usage logs for the past 48 hours
    FOR i IN 0..47 LOOP
        INSERT INTO usage_logs (user_id, twitter_handle, token_count, metric_type, timestamp, hour_bucket, meta)
        VALUES (
            demo_user_id,
            demo_handle,
            -- Random token count between 500K and 3M per hour
            500000 + floor(random() * 2500000)::int,
            'aggregate',
            NOW() - (i || ' hours')::interval,
            date_trunc('hour', NOW() - (i || ' hours')::interval),
            jsonb_build_object(
                'input', 200000 + floor(random() * 1000000)::int,
                'output', 300000 + floor(random() * 1500000)::int,
                'cache_read', 100000 + floor(random() * 500000)::int,
                'cache_write', 20000 + floor(random() * 100000)::int
            )
        );
    END LOOP;
    
    RAISE NOTICE 'Inserted 48 hours of usage data for @%', demo_handle;
END $$;

-- Verify the data
SELECT twitter_handle, input_tokens, output_tokens, total_tokens, cache_read_tokens, cache_write_tokens
FROM profiles 
WHERE twitter_handle = 'PLACEHOLDER_HANDLE';  -- ← CHANGE THIS TOO

SELECT count(*) as usage_log_count, sum(token_count) as total_logged
FROM usage_logs 
WHERE twitter_handle = 'PLACEHOLDER_HANDLE';  -- ← CHANGE THIS TOO
