import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { hashApiKey } from '@/lib/utils';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// POST: Generate a new device code (Public)
export async function POST() {
    const code = crypto.randomBytes(3).toString('hex').toUpperCase(); // 6 chars
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 mins

    const { error } = await supabase
        .from('device_codes')
        .insert({ code, expires_at: expiresAt });

    if (error) {
        return NextResponse.json({ error: 'Failed to generate code' }, { status: 500 });
    }

    return NextResponse.json({
        device_code: code,
        verification_uri: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/device`,
        expires_in: 600,
        interval: 5
    });
}

// PUT: Verify a device code (Authenticated)
export async function PUT(req: NextRequest) {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return NextResponse.json({ error: 'Missing token' }, { status: 401 });
    const token = authHeader.replace('Bearer ', '');

    const client = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { global: { headers: { Authorization: `Bearer ${token}` } } }
    );

    const { data: { user }, error: authError } = await client.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const { code } = await req.json();
    if (!code) return NextResponse.json({ error: 'Code required' }, { status: 400 });

    // Generate NEW API Key for the user (Resetting old one)
    const apiKey = 'sk_claude_' + crypto.randomBytes(16).toString('hex');
    const apiKeyHash = await hashApiKey(apiKey);

    // Update Leaderboard first
    const { error: lbError } = await client
        .from('profiles')
        .update({ api_key_hash: apiKeyHash })
        .eq('id', user.id);

    if (lbError) {
        console.error('LB Error', lbError);
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }

    // Update Device Code
    const { error: dcError } = await client
        .from('device_codes')
        .update({
            verified: true,
            user_id: user.id,
            temp_api_key: apiKey
        })
        .eq('code', code);

    if (dcError) {
        return NextResponse.json({ error: 'Failed to verify code' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}

// GET: Poll for status (Public)
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');

    if (!code) {
        return NextResponse.json({ error: 'Code required' }, { status: 400 });
    }

    const { data, error } = await supabase
        .from('device_codes')
        // Join with profiles to get handle
        .select('verified, user_id, temp_api_key, profiles(twitter_handle)')
        .eq('code', code)
        .single();

    if (error || !data) {
        return NextResponse.json({ error: 'Invalid code' }, { status: 404 });
    }

    if (data.verified) {
        return NextResponse.json({
            status: 'complete',
            // @ts-ignore
            twitter_handle: data.profiles?.twitter_handle,
            api_key: data.temp_api_key
        });
    }

    return NextResponse.json({ status: 'pending' });
}
