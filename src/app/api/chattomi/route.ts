import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const response = await fetch("http://3.106.53.200:8283/v1/agents/agent-20668ec2-ef80-4f5f-9405-e6cacaf1c92c/messages", {
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