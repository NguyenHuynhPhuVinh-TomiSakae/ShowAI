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
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
}

async function generatePostWithOpenRouter(apiKey: string, prompt: string, model: string) {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "HTTP-Referer": `${process.env.NEXT_PUBLIC_SITE_URL}`,
            "X-Title": `${process.env.NEXT_PUBLIC_SITE_NAME}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "model": model,
            "messages": [{ "role": "user", "content": prompt }]
        })
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
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

        const randomIndex = Math.floor(Math.random() * animeCharacters.length);
        const character = animeCharacters[randomIndex];

        if (!character) {
            throw new Error('Không thể chọn nhân vật ngẫu nhiên');
        }

        const primaryApiKey = process.env.GEMINI_API_KEY_AI_1;
        const backupApiKey = process.env.GEMINI_API_KEY_AI_2;
        const openRouterKey = process.env.OPENROUTER_API_KEY;

        if (!primaryApiKey) {
            throw new Error('GEMINI_API_KEY_AI_1 không được cấu hình');
        }

        const prompt = `Hãy viết một bài đăng mạng xã hội ngắn (dưới 280 ký tự) với tính cách của ${character.name} - ${character.personality}. 
                       Bài đăng phải thể hiện đúng tính cách nhân vật và có thể bao gồm hashtag.`;

        let post: string | null = null;

        // Thử với Gemini 1.5-flash (tài khoản chính)
        try {
            post = await generatePostWithGemini(primaryApiKey, prompt);
        } catch (error) {
            console.log('Lỗi với Gemini (tài khoản chính):', error);

            // Thử với tài khoản backup nếu có
            if (backupApiKey) {
                try {
                    post = await generatePostWithGemini(backupApiKey, prompt);
                } catch (error) {
                    console.log('Lỗi với Gemini (tài khoản backup):', error);
                }
            }

            // Nếu cả hai tài khoản Gemini đều thất bại, thử với Gemma
            if (!post && openRouterKey) {
                try {
                    post = await generatePostWithOpenRouter(openRouterKey, prompt, "google/gemma-7b-it");
                } catch (error) {
                    console.log('Lỗi với Gemma:', error);
                }
            }
        }

        if (!post) {
            throw new Error('Không thể tạo nội dung với bất kỳ model nào');
        }

        const hashtags = extractHashtags(post);
        const cleanContent = post.replace(/#[^\s#]+/g, '').trim();

        const newPost = {
            content: cleanContent,
            hashtags: hashtags,
            characterId: character.id,
            characterName: character.name,
            timestamp: ServerValue.TIMESTAMP,
            likes: 0,
            comments: {}
        };

        const postsRef = database.ref('posts');
        const { key: newPostId } = await postsRef.push(newPost);

        return NextResponse.json({
            success: true,
            post: cleanContent,
            postId: newPostId,
            hashtags,
            characterId: character.id
        });

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
