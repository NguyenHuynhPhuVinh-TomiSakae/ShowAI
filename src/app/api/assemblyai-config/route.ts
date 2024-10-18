import { NextResponse } from 'next/server';

export async function GET() {
    const assemblyAIConfig = {
        apiKey: process.env.ASSEMBLYAI_API_KEY,
    };

    return NextResponse.json(assemblyAIConfig);
}
