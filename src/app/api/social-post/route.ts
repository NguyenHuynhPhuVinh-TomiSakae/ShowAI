/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getDatabase, ServerValue, Database } from 'firebase-admin/database';
import { animeCharacters } from '@/data/animeCharacters';

// Khởi tạo Firebase Admin với kiểm tra URL
let database: Database | undefined;
try {
    if (!getApps().length) {
        if (!process.env.FIREBASE_DATABASE_URL) {
            throw new Error('FIREBASE_DATABASE_URL is not configured');
        }

        initializeApp({
            credential: cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
            }),
            databaseURL: process.env.FIREBASE_DATABASE_URL
        });
    }
    database = getDatabase();
} catch (error) {
    console.error('Firebase initialization error:', error);
}

// Thêm export config để ngăn pre-rendering
export const dynamic = 'force-dynamic';

async function generatePostWithGemini(apiKey: string, prompt: string) {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
}

// Thêm hàm helper để trích xuất hashtags
function extractHashtags(text: string): string[] {
    const hashtagRegex = /#[^\s#]+/g;
    return text.match(hashtagRegex) || [];
}

export async function GET(request: Request) {
    try {
        if (!database) {
            throw new Error('Database connection not initialized');
        }

        // Thay thế phần lấy characterId từ params bằng việc chọn ngẫu nhiên
        const randomIndex = Math.floor(Math.random() * animeCharacters.length);
        const character = animeCharacters[randomIndex];

        if (!character) {
            throw new Error('Không thể chọn nhân vật ngẫu nhiên');
        }

        const primaryApiKey = process.env.GEMINI_API_KEY_AI_1;
        const backupApiKey = process.env.GEMINI_API_KEY_AI_2;

        if (!primaryApiKey) {
            throw new Error('GEMINI_API_KEY_AI_1 không được cấu hình');
        }

        const prompt = `Hãy viết một bài đăng mạng xã hội ngắn (dưới 280 ký tự) với tính cách của ${character.name} - ${character.personality}. 
                       Bài đăng phải thể hiện đúng tính cách nhân vật và có thể bao gồm hashtag.`;

        let post: string | null = null;
        try {
            post = await generatePostWithGemini(primaryApiKey, prompt);
        } catch (primaryKeyError) {
            console.log('Key chính bị lỗi, thử dùng key dự phòng');
            if (backupApiKey) {
                post = await generatePostWithGemini(backupApiKey, prompt);
            } else {
                throw new Error('Không có key dự phòng và key chính đã thất bại');
            }
        }

        if (!post) {
            throw new Error('Gemini không tạo được nội dung');
        }

        const hashtags = extractHashtags(post);
        const cleanContent = post.replace(/#[^\s#]+/g, '').trim();

        try {
            const postsRef = database.ref('posts');
            const newPost = {
                content: cleanContent,
                hashtags: hashtags,
                characterId: character.id,
                characterName: character.name,
                timestamp: ServerValue.TIMESTAMP,
                likes: 0
            };

            await postsRef.push(newPost);

            return NextResponse.json({
                success: true,
                post: cleanContent,
                hashtags,
                characterId: character.id
            });
        } catch (dbError) {
            console.error('Lỗi khi lưu vào database:', dbError);
            throw new Error('Không thể lưu bài đăng vào database');
        }

    } catch (error: any) {
        console.error('Chi tiết lỗi:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Không thể tạo bài đăng',
                details: process.env.NODE_ENV === 'development' ? error.toString() : undefined
            },
            { status: 500 }
        );
    }
}
