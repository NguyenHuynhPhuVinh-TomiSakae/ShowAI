import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { text } = await req.json();

        // Gọi API audio_query với params thay vì body
        const queryUrl = new URL('http://54.251.229.43:50021/audio_query');
        queryUrl.searchParams.append('text', text);
        queryUrl.searchParams.append('speaker', '1');

        const queryResponse = await fetch(queryUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        const queryData = await queryResponse.json();

        // Gọi API synthesis
        const synthesisResponse = await fetch(
            'http://54.251.229.43:50021/synthesis?speaker=1',
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(queryData)
            }
        );

        // Lấy audio data dưới dạng ArrayBuffer
        const audioBuffer = await synthesisResponse.arrayBuffer();

        // Trả về với Content-Type chính xác
        return new NextResponse(audioBuffer, {
            headers: {
                'Content-Type': 'audio/wav',
                'Content-Length': audioBuffer.byteLength.toString()
            }
        });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
} 