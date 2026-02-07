import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { hashApiKey } from '@/lib/utils';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return NextResponse.json({ error: 'Missing token' }, { status: 401 });

    const token = authHeader.replace('Bearer ', '');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    // Create a client that acts as the user
    const client = createClient(supabaseUrl, supabaseKey, {
        global: { headers: { Authorization: `Bearer ${token}` } }
    });

    const { data: { user }, error } = await client.auth.getUser();
    if (error || !user) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const twitterHandle = user.user_metadata?.preferred_username || user.user_metadata?.user_name || user.email?.split('@')[0];
    const avatarUrl = user.user_metadata?.avatar_url;

    // Check existing
    const { data: existing } = await client.from('profiles').select('id').eq('id', user.id).single();

    let apiKey = null;

    if (!existing) {
        const rawKey = 'sk_airank_' + crypto.randomBytes(16).toString('hex');
        const hash = await hashApiKey(rawKey);

        const { error: insertError } = await client.from('profiles').insert({
            id: user.id, // Explicitly set ID to match auth.uid()
            twitter_handle: twitterHandle,
            avatar_url: avatarUrl,
            api_key_hash: hash,
            last_active: new Date().toISOString()
        });

        if (insertError) {
            console.error('Insert error:', insertError);
            return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 });
        }

        apiKey = rawKey;
    } else {
        // Update metadata
        await client.from('profiles').update({
            twitter_handle: twitterHandle,
            avatar_url: avatarUrl,
            last_active: new Date().toISOString()
        }).eq('id', user.id);
    }

    return NextResponse.json({ success: true, api_key: apiKey });
}
