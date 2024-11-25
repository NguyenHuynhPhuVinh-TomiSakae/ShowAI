/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function GET() {
    // Thử lần lượt các KEY từ 1 đến 12
    for (let i = 1; i <= 12; i++) {
        const apiKey = process.env[`GEMINI_API_KEY_AI_${i}`];
        if (!apiKey) continue;

        try {
            // Thử kết nối với KEY hiện tại
            const genAI = new GoogleGenerativeAI(apiKey);
            await genAI.getGenerativeModel({ model: "gemini-exp-1121" }).generateContent("test");
            return NextResponse.json({ success: true, apiKey });
        } catch (error) {
            console.log(`KEY ${i} không hoạt động, thử KEY tiếp theo`);
            continue;
        }
    }

    // Nếu tất cả KEY đều lỗi
    return NextResponse.json(
        { success: false, error: 'Tất cả KEY đều không hoạt động' },
        { status: 500 }
    );
}