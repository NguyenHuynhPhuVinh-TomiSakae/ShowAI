import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({
        projectKey: process.env.OPENREPLAY_PROJECT_KEY
    });
}
