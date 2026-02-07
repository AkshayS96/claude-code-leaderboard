import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { LeaderboardUser } from '@/lib/types';

export const revalidate = 30; // 30s cache

// ..

export async function GET() {
    try {
        const { rows } = await db.query(`
        SELECT id, twitter_handle, avatar_url, input_tokens, output_tokens, cache_read_tokens, cache_write_tokens, total_tokens, last_active, created_at
        FROM profiles
        ORDER BY total_tokens DESC
        LIMIT 100
      `);

        const users: LeaderboardUser[] = rows.map((row: any, i: number) => {
            const input = Number(row.input_tokens);
            const output = Number(row.output_tokens);
            const cacheRead = Number(row.cache_read_tokens);
            const cacheWrite = Number(row.cache_write_tokens);
            const total = Number(row.total_tokens); // input + output (for ranking)
            const totalInput = input + cacheRead;
            const savingsScore = totalInput > 0 ? (cacheRead / totalInput) * 100 : 0;

            return {
                ...row,
                input_tokens: input,
                output_tokens: output,
                cache_read_tokens: cacheRead,
                cache_write_tokens: cacheWrite,
                total_tokens: total,
                savings_score: savingsScore,
                rank: i + 1
            };
        });

        // Calculate Peak T/s (based on max hourly volume)
        // And get 24h volume + graph data
        const { rows: statsRows } = await db.query(`
            SELECT 
                hour_bucket,
                SUM(token_count) as total_tokens,
                COUNT(DISTINCT user_id) as active_users
            FROM usage_logs
            WHERE metric_type = 'aggregate' 
            AND hour_bucket >= NOW() - INTERVAL '24 hours'
            GROUP BY hour_bucket
            ORDER BY hour_bucket DESC
        `);

        // 1. Peak Throughput (max hourly / 3600) - check all time or just recent?
        // User asked for "Peak T/s" which implies all time usually, but 
        // for now let's use the recent window or query separately if needed.
        // Actually, let's query all-time peak separately as it's a "record".
        const { rows: peakRows } = await db.query(`
             SELECT SUM(token_count) as total FROM usage_logs 
             WHERE metric_type = 'aggregate' 
             GROUP BY hour_bucket 
             ORDER BY total DESC LIMIT 1
        `);
        const peakThroughput = peakRows.length > 0 ? Math.round(Number(peakRows[0].total) / 3600) : 0;

        // 2. Total 24h Volume
        const last24hTokens = statsRows.reduce((acc, row) => acc + Number(row.total_tokens), 0);

        // 3. Active Users (24h) - Approximate sum of distincts per hour isn't quite right for "unique users in 24h"
        // but let's query distinct user_id from the last 24h raw
        const { rows: activeUsersRows } = await db.query(`
            SELECT COUNT(DISTINCT user_id) as count 
            FROM usage_logs 
            WHERE timestamp >= NOW() - INTERVAL '24 hours'
        `);
        const activeUsers24h = Number(activeUsersRows[0]?.count || 0);

        // 4. Graph Data (Last 12h for better context, frontend can slice to 6)
        const graphData = statsRows
            .map(row => ({
                time: row.hour_bucket,
                tokens: Number(row.total_tokens),
                active_users: Number(row.active_users)
            }))
            .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

        return NextResponse.json({
            users,
            stats: {
                peak_throughput: peakThroughput,
                last_24h_tokens: last24hTokens,
                active_users_24h: activeUsers24h,
                graph_data: graphData
            }
        });
    } catch (e: any) {
        console.log(e)
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
