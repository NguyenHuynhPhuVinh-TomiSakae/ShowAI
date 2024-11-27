import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const response = await fetch(`${process.env.SHOWAI_LETTA_API_URL}/v1/agents/${process.env.LETTA_AGENT_ID}/messages`, {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'content-type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        // Trả về response stream
        return new NextResponse(response.body);

    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json(
            { message: 'Đã xảy ra lỗi khi xử lý yêu cầu' },
            { status: 500 }
        );
    }
}