import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { LeaderboardUser } from '@/lib/types';

export const revalidate = 30; // 30s cache

export async function GET() {
    try {
        const { rows } = await db.query(`
        SELECT id, twitter_handle, input_tokens, output_tokens, cache_tokens, last_active, created_at
        FROM profiles
        ORDER BY (input_tokens + output_tokens + cache_tokens) DESC
        LIMIT 100
      `);

        const users: LeaderboardUser[] = rows.map((row: any, i: number) => {
            const input = Number(row.input_tokens);
            const output = Number(row.output_tokens);
            const cache = Number(row.cache_tokens);
            const total = input + output + cache;
            const totalInput = input + cache;
            const savingsScore = totalInput > 0 ? (cache / totalInput) * 100 : 0;

            return {
                ...row,
                input_tokens: input,
                output_tokens: output,
                cache_tokens: cache,
                total_tokens: total,
                savings_score: savingsScore,
                rank: i + 1
            };
        });

        return NextResponse.json(users);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
