import { NextResponse } from 'next/server';

export async function GET() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        return NextResponse.json(
            { error: 'Các khóa Supabase không được cấu hình' },
            { status: 500 }
        );
    }

    return NextResponse.json({
        url: supabaseUrl,
        key: supabaseKey
    });
}