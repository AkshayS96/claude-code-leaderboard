import { Pool } from '@neondatabase/serverless';

// Default to a placeholder if not set, to allow build to pass
const connectionString = process.env.DATABASE_URL || 'postgres://user:pass@host/db';

export const db = new Pool({ connectionString });
