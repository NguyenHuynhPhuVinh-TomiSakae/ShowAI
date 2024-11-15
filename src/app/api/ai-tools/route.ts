/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '0';
    const size = searchParams.get('size') || '9';

    try {
        const response = await fetch(
            `https://showaisb.onrender.com/api/newly-launched?size=${size}&page=${page}`,
            {
                headers: {
                    'Accept': '*/*'
                }
            }
        );

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json(
            { error: 'Không thể tải dữ liệu' },
            { status: 500 }
        );
    }
}
