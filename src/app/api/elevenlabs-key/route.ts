import { NextResponse } from 'next/server';

export async function GET() {
    const elevenLabsKey = process.env.ELEVENLABS_API_KEY;

    if (!elevenLabsKey) {
        return NextResponse.json({ error: 'ELEVENLABS_API_KEY không được cấu hình' }, { status: 500 });
    }

    return NextResponse.json({ key: elevenLabsKey });
}
