-- Migration: Update token structure and add hourly aggregation
-- Run this in Supabase SQL Editor

-- Step 1: Rename cache_tokens to cache_read_tokens
ALTER TABLE profiles RENAME COLUMN cache_tokens TO cache_read_tokens;

-- Step 2: Add cache_write_tokens column
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cache_write_tokens BIGINT DEFAULT 0;

-- Step 3: Recreate total_tokens as input + output only (for ranking)
-- First drop the generated column
ALTER TABLE profiles DROP COLUMN IF EXISTS total_tokens;
-- Then recreate it with new formula
ALTER TABLE profiles ADD COLUMN total_tokens BIGINT GENERATED ALWAYS AS (input_tokens + output_tokens) STORED;

-- Step 4: Add hour_bucket column to usage_logs for hourly aggregation
-- This avoids the IMMUTABLE function issue with date_trunc in indexes
ALTER TABLE usage_logs ADD COLUMN IF NOT EXISTS hour_bucket TIMESTAMPTZ;

-- Step 5: Create unique index on (user_id, hour_bucket) for upsert
CREATE UNIQUE INDEX IF NOT EXISTS idx_usage_logs_user_hour_bucket 
ON usage_logs (user_id, hour_bucket) 
WHERE metric_type = 'aggregate';

-- Step 6: Update increment_tokens RPC for new columns
CREATE OR REPLACE FUNCTION increment_tokens(
  target_user_id UUID, 
  inc_input BIGINT, 
  inc_output BIGINT, 
  inc_cache_read BIGINT,
  inc_cache_write BIGINT
)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles
  SET 
    input_tokens = input_tokens + inc_input,
    output_tokens = output_tokens + inc_output,
    cache_read_tokens = cache_read_tokens + inc_cache_read,
    cache_write_tokens = cache_write_tokens + inc_cache_write,
    last_active = NOW()
  WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 7: Enable insert policy for usage_logs (needed for OTel endpoint)
DROP POLICY IF EXISTS "Allow service insert usage_logs" ON usage_logs;
CREATE POLICY "Allow service insert usage_logs" 
ON usage_logs FOR INSERT 
WITH CHECK (true);
