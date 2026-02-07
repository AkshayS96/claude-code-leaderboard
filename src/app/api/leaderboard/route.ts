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

        return NextResponse.json({
            users,
            stats: {
                peak_throughput: 0 // Redis disabled for now
            }
        });
    } catch (e: any) {
        console.log(e)
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
