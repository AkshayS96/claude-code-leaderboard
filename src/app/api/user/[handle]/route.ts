import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { LeaderboardUser } from '@/lib/types';

export async function GET(req: NextRequest, { params }: { params: Promise<any> }) {
    const { handle } = await params;

    try {
        const { rows } = await db.query(
            `SELECT id, twitter_handle, input_tokens, output_tokens, cache_tokens, last_active, created_at FROM profiles WHERE twitter_handle = $1`,
            [handle]
        );

        if (rows.length === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const user = rows[0];
        const input = Number(user.input_tokens);
        const output = Number(user.output_tokens);
        const cache = Number(user.cache_tokens);
        const total = input + output + cache;
        const totalInput = input + cache;
        const savingsScore = totalInput > 0 ? (cache / totalInput) * 100 : 0;

        // Get Rank: Count users with more tokens
        const result = await db.query(
            `SELECT count(*) as rank_above FROM profiles WHERE total_tokens > $1`,
            [total]
        );
        const rankAbove = Number(result.rows[0].rank_above);

        const response: LeaderboardUser = {
            ...user,
            input_tokens: input,
            output_tokens: output,
            cache_tokens: cache,
            total_tokens: total,
            savings_score: savingsScore,
            rank: rankAbove + 1
        };

        return NextResponse.json(response);

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
