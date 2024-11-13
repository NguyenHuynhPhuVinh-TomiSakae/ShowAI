// app/api/groq-key/route.ts

import { NextResponse } from 'next/server';
import { Groq } from 'groq-sdk';

export async function GET() {
    // Thử key chính trước
    const apiKey = process.env.GROQ_API_KEY;
    let validKey = null;

    // Hàm kiểm tra key có hoạt động không
    const testKey = async (key: string) => {
        try {
            const groq = new Groq({
                apiKey: key,
                dangerouslyAllowBrowser: true
            });

            // Thử gọi API với một request đơn giản
            const response = await groq.chat.completions.create({
                messages: [{ role: "user", content: "test" }],
                model: "mixtral-8x7b-32768",
                temperature: 0.5,
                max_tokens: 10
            });

            return response ? true : false;
        } catch (error) {
            console.error(`Key test failed: ${error}`);
            return false;
        }
    };

    // Thử key chính
    if (apiKey) {
        const isValid = await testKey(apiKey);
        if (isValid) {
            validKey = apiKey;
        }
    }

    // Nếu key chính không hoạt động, thử các key dự phòng
    if (!validKey) {
        for (let i = 1; i <= 9; i++) {
            const backupKey = process.env[`GROQ_API_KEY_${i}`];
            if (backupKey) {
                const isValid = await testKey(backupKey);
                if (isValid) {
                    validKey = backupKey;
                    break;
                }
            }
        }
    }

    if (!validKey) {
        return NextResponse.json(
            { error: 'Không tìm thấy GROQ API key hợp lệ hoặc tất cả key đều không hoạt động' },
            { status: 500 }
        );
    }

    return NextResponse.json({ key: validKey });
}
