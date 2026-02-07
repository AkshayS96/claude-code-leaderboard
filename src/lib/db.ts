import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

// Configure WebSocket for local development
neonConfig.webSocketConstructor = ws;

// Default to a placeholder if not set, to allow build to pass
const connectionString = process.env.DATABASE_URL || 'postgres://user:pass@host/db';

const pool = new Pool({ connectionString });

// Suppress unhandled error events
pool.on('error', (err: Error) => {
    console.warn('Database pool error:', err.message);
});

export const db = {
    async query(text: string, params?: any[]) {
        try {
            return await pool.query(text, params);
        } catch (err: any) {
            console.error('Database query error:', err.message);
            throw err;
        }
    }
};
