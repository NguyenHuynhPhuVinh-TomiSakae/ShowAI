import { NextResponse } from 'next/server';

export async function GET() {
    const key = process.env.DEEPINFRA_API_KEY;

    if (!key) {
        return NextResponse.json(
            { success: false, error: 'Không tìm thấy API key' },
            { status: 500 }
        );
    }

    return NextResponse.json({ success: true, key });
}