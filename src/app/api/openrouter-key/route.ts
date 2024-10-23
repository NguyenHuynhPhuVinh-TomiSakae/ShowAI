import { NextResponse } from 'next/server';

export async function GET() {
    const openrouterKey = process.env.OPENROUTER_API_KEY;

    if (!openrouterKey) {
        return NextResponse.json({ error: 'Khóa OPENROUTER không được cấu hình' }, { status: 500 });
    }

    return NextResponse.json({ key: openrouterKey });
}
