// app/api/groq-key/route.ts

import { NextResponse } from 'next/server';

// Biến để theo dõi key đang sử dụng
let currentKeyIndex = 0;
let lastUsedTime = 0;
const COOLDOWN_TIME = 60000; // 1 phút cooldown

export async function GET() {
    const now = Date.now();

    // Lấy tất cả key có sẵn
    const keys: string[] = [];

    // Thêm key chính nếu có
    if (process.env.GROQ_API_KEY) {
        keys.push(process.env.GROQ_API_KEY);
    }

    // Thêm các key dự phòng
    for (let i = 1; i <= 9; i++) {
        const backupKey = process.env[`GROQ_API_KEY_${i}`];
        if (backupKey) {
            keys.push(backupKey);
        }
    }

    if (keys.length === 0) {
        return NextResponse.json(
            { error: 'Không tìm thấy GROQ API key' },
            { status: 500 }
        );
    }

    // Kiểm tra cooldown và chuyển sang key mới
    if (now - lastUsedTime < COOLDOWN_TIME) {
        currentKeyIndex = (currentKeyIndex + 1) % keys.length;
    }

    // Lấy key hiện tại
    const currentKey = keys[currentKeyIndex];
    lastUsedTime = now;

    return NextResponse.json({
        key: currentKey,
        keyIndex: currentKeyIndex,
        remainingKeys: keys.length - 1
    });
}
