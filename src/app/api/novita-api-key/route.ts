import { NextResponse } from 'next/server';

export async function GET() {
    const novitaApiKey = process.env.NOVITA_API_KEY;

    if (!novitaApiKey) {
        return NextResponse.json({ error: 'NOVITA_API_KEY không được cấu hình' }, { status: 500 });
    }

    return NextResponse.json({ apiKey: novitaApiKey });
} 