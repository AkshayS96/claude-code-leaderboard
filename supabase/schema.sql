-- Enable pgcrypto for UUID generation
create extension if not exists "pgcrypto";

-- profiles table (formerly leaderboard)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    twitter_handle TEXT UNIQUE NOT NULL,
    api_key_hash TEXT NOT NULL,
    avatar_url TEXT,
    input_tokens BIGINT DEFAULT 0,
    output_tokens BIGINT DEFAULT 0,
    cache_tokens BIGINT DEFAULT 0,
    total_tokens BIGINT GENERATED ALWAYS AS (input_tokens + output_tokens + cache_tokens) STORED,
    last_active TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- usage_logs table for historical tracking
CREATE TABLE IF NOT EXISTS usage_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  twitter_handle TEXT,
  token_count INT,
  metric_type TEXT, -- 'input', 'output', 'cache_read'
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  meta JSONB DEFAULT '{}'::jsonb
);

-- device_codes table for auth flow
CREATE TABLE IF NOT EXISTS device_codes (
    code TEXT PRIMARY KEY,
    user_id UUID REFERENCES profiles(id),
    expires_at TIMESTAMPTZ NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    temp_api_key TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_total_tokens ON profiles (total_tokens DESC);
CREATE INDEX IF NOT EXISTS idx_usage_logs_user_date ON usage_logs (user_id, timestamp);

-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Allow public read access" ON profiles FOR SELECT USING (true);
CREATE POLICY "Allow update own row" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Allow insert own row" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Device Codes Policies
CREATE POLICY "Allow public insert device_codes" ON device_codes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read device_codes" ON device_codes FOR SELECT USING (true);
CREATE POLICY "Allow auth update device_codes" ON device_codes FOR UPDATE USING (auth.role() = 'authenticated');

-- Usage Logs Policies
CREATE POLICY "Allow public read usage_logs" ON usage_logs FOR SELECT USING (true);
-- Only service role should insert usage logs typically, via the API.
-- But if we use RLS for API, we might need an insert policy for authenticated users?
-- The OTel endpoint will be server-side, likely using Service Role key or bypassing RLS via RPC?
-- For now, let's allow auth insert for simplicity if needed, but the /api/metrics route handles it.

-- Storage Policies for 'avatars' bucket
BEGIN;
  INSERT INTO storage.buckets (id, name, public) 
  VALUES ('avatars', 'avatars', true)
  ON CONFLICT (id) DO NOTHING;

  -- Public Read
  DO $$
  BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Avatar Public Read'
    ) THEN
        CREATE POLICY "Avatar Public Read" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
    END IF;
  END
  $$;

  -- Auth Upload
  DO $$
  BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Avatar Auth Upload'
    ) THEN
        CREATE POLICY "Avatar Auth Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');
    END IF;
  END
  $$;

COMMIT;

-- RPC for atomic token increment
CREATE OR REPLACE FUNCTION increment_tokens(
  target_user_id UUID, 
  inc_input BIGINT, 
  inc_output BIGINT, 
  inc_cache BIGINT
)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles
  SET 
    input_tokens = input_tokens + inc_input,
    output_tokens = output_tokens + inc_output,
    cache_tokens = cache_tokens + inc_cache,
    last_active = NOW()
  WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC to get user rank
CREATE OR REPLACE FUNCTION get_user_rank(target_user_id UUID)
RETURNS BIGINT AS $$
DECLARE
  target_total BIGINT;
  rank BIGINT;
BEGIN
  -- Get the total tokens for the user
  SELECT total_tokens INTO target_total
  FROM profiles
  WHERE id = target_user_id;

  IF target_total IS NULL THEN
    RETURN 0;
  END IF;

  -- Count how many have more tokens
  SELECT COUNT(*) + 1 INTO rank
  FROM profiles
  WHERE total_tokens > target_total;

  RETURN rank;
END;
$$ LANGUAGE plpgsql;
