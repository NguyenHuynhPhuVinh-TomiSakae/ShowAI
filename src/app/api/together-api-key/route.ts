import { NextResponse } from 'next/server';

export async function GET() {
    const togetherApiKey = process.env.TOGETHER_API_KEY;

    if (!togetherApiKey) {
        return NextResponse.json({ error: 'TOGETHER_API_KEY không được cấu hình' }, { status: 500 });
    }

    return NextResponse.json({ apiKey: togetherApiKey });
}
