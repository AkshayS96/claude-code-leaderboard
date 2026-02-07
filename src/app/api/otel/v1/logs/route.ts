import { NextRequest, NextResponse } from 'next/server';

// POST: Receive OTel logs from Claude Code (currently just acknowledge)
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        console.log('Received OTel logs:', JSON.stringify(body).slice(0, 500));

        // For now, just acknowledge - we can process logs later for event tracking
        return NextResponse.json({ success: true });
    } catch (e: any) {
        console.error('OTel logs error:', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
