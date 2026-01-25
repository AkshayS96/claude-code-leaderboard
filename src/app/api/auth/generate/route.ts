import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { hashApiKey } from '@/lib/utils';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
    try {
        const { handle } = await req.json();
        if (!handle) return NextResponse.json({ error: 'Handle required' }, { status: 400 });

        // Generate a new key starting with sk_claude_
        const apiKey = 'sk_claude_' + crypto.randomBytes(16).toString('hex');
        const apiKeyHash = await hashApiKey(apiKey);

        // Store in DB
        const { error } = await supabase
            .from('profiles')
            .upsert({
                twitter_handle: handle,
                api_key_hash: apiKeyHash,
                last_active: new Date().toISOString()
            }, { onConflict: 'twitter_handle' });

        if (error) {
            console.error('DB Error:', error);
            return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
        }

        // Return the raw key to the user ONE TIME
        return NextResponse.json({ success: true, api_key: apiKey });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
