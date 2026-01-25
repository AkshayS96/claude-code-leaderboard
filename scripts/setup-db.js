
const { Pool } = require('@neondatabase/serverless');

// Using the same env var or default
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL is not set.');
  process.exit(1);
}

const db = new Pool({ connectionString });

async function main() {
  console.log('Setting up database schema...');

  const client = await db.connect();

  try {
    // Create leaderboard table
    await client.query(`
      CREATE TABLE IF NOT EXISTS leaderboard (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        twitter_handle TEXT UNIQUE NOT NULL,
        input_tokens INTEGER DEFAULT 0,
        output_tokens INTEGER DEFAULT 0,
        cache_tokens INTEGER DEFAULT 0,
        total_tokens INTEGER DEFAULT 0,
        last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        api_key_hash TEXT
      );
    `);
    console.log('Created leaderboard table.');

    // Create device_codes table
    await client.query(`
      CREATE TABLE IF NOT EXISTS device_codes (
        code TEXT PRIMARY KEY,
        user_id UUID REFERENCES leaderboard(id),
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        temp_api_key TEXT
      );
    `);
    console.log('Created device_codes table.');

  } catch (err) {
    console.error('Error setting up database:', err);
  } finally {
    client.release();
    // End the pool
    await db.end();
  }
}

main();
