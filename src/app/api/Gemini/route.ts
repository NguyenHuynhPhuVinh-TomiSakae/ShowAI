import { NextResponse } from 'next/server';

export async function GET() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return NextResponse.json({ success: false, error: 'API key not configured' }, { status: 500 });
    }
    return NextResponse.json({ success: true, apiKey });
}