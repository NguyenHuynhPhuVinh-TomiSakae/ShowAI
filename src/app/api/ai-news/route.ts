/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const per_page = searchParams.get('per_page') || '9';

    try {
        const response = await fetch(
            `https://showairust.onrender.com/articles?page=${page}&per_page=${per_page}`,
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
