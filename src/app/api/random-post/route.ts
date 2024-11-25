import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getDatabase, ServerValue, Database } from 'firebase-admin/database';

// Khởi tạo Firebase Admin
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

export const dynamic = 'force-dynamic';

async function getRandomCharacter() {
    if (!database) {
        throw new Error('Database connection not initialized');
    }

    const charactersRef = database.ref('characters');
    const snapshot = await charactersRef.once('value');
    const characters = snapshot.val();

    if (!characters) {
        throw new Error('Không tìm thấy nhân vật nào trong database');
    }

    const characterArray = Object.entries(characters).map(([id, data]: [string, any]) => ({
        id,
        ...data
    }));

    if (characterArray.length === 0) {
        throw new Error('Không có nhân vật nào trong database');
    }

    const randomIndex = Math.floor(Math.random() * characterArray.length);
    return characterArray[randomIndex];
}

async function generatePostWithGemini(apiKey: string, prompt: string) {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-exp-1121" });
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

function extractHashtags(text: string): string[] {
    const hashtags: string[] = [];
    const parts = text.split('#');

    for (let i = 1; i < parts.length; i++) {
        if (parts[i].trim()) {
            const endIndex = parts[i].indexOf('#');
            const hashtag = endIndex !== -1
                ? parts[i].substring(0, endIndex).trim()
                : parts[i].trim();
            hashtags.push('#' + hashtag.replace(/\s+/g, ''));
        }
    }

    return hashtags;
}

export async function GET() {
    try {
        if (!database) {
            throw new Error('Database connection not initialized');
        }

        // Lấy nhân vật ngẫu nhiên trực tiếp từ database
        const character = await getRandomCharacter();

        const primaryApiKey = process.env.GEMINI_API_KEY_AI_1;
        const backupApiKey = process.env.GEMINI_API_KEY_AI_2;
        const openRouterKey = process.env.OPENROUTER_API_KEY;

        if (!primaryApiKey) {
            throw new Error('GEMINI_API_KEY_AI_1 không được cấu hình');
        }

        const prompt = `Hãy viết một bài đăng mạng xã hội ngắn (dưới 280 ký tự) về ${character.name} với tính cách ${character.personality}. 
                       Bài đăng phải mang tính giáo dục, chia sẻ một tip hoặc kiến thức thú vị về công nghệ này.
                       Có thể bao gồm hashtag với quy tắc:
                       - Viết liền với dấu # không có khoảng trắng
                       - Nếu hashtag có nhiều từ thì viết liền (ví dụ: #LậpTrìnhVuiVe hoặc #CodeNewbie)`;

        let post: string | null = null;

        try {
            post = await generatePostWithGemini(primaryApiKey, prompt);
        } catch (error) {
            console.log('Lỗi với Gemini (tài khoản chính):', error);

            if (backupApiKey) {
                try {
                    post = await generatePostWithGemini(backupApiKey, prompt);
                } catch (error) {
                    console.log('Lỗi với Gemini (tài khoản backup):', error);
                }
            }

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
            userId: character.userId,
            userName: character.userName,
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
            characterId: character.id,
            characterName: character.name
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
