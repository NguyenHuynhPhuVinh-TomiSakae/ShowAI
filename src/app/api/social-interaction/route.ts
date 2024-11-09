import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getDatabase, ServerValue, Database } from 'firebase-admin/database';
import { animeCharacters } from '@/data/animeCharacters';
import type { Reference } from 'firebase-admin/database';

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

export const dynamic = 'force-dynamic';

async function generateCommentWithGemini(apiKey: string, prompt: string) {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
}

async function generateCommentWithOpenRouter(apiKey: string, prompt: string, model: string) {
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

async function generateComment(post: any, character: any) {
    const primaryApiKey = process.env.GEMINI_API_KEY_AI_1;
    const backupApiKey = process.env.GEMINI_API_KEY_AI_2;
    const openRouterKey = process.env.OPENROUTER_API_KEY;

    if (!primaryApiKey) {
        throw new Error('GEMINI_API_KEY_AI_1 không được cấu hình');
    }

    const prompt = `Với tư cách là ${character.name} (${character.personality}), 
                   hãy viết một bình luận ngắn (dưới 100 ký tự) cho bài đăng sau: "${post.content}"`;

    let comment: string | null = null;

    // Thử với Gemini 1.5-flash (tài khoản chính)
    try {
        comment = await generateCommentWithGemini(primaryApiKey, prompt);
    } catch (error) {
        console.log('Lỗi với Gemini (tài khoản chính):', error);

        // Thử với tài khoản backup nếu có
        if (backupApiKey) {
            try {
                comment = await generateCommentWithGemini(backupApiKey, prompt);
            } catch (error) {
                console.log('Lỗi với Gemini (tài khoản backup):', error);
            }
        }

        // Nếu cả hai tài khoản Gemini đều thất bại, thử với Gemma
        if (!comment && openRouterKey) {
            try {
                comment = await generateCommentWithOpenRouter(openRouterKey, prompt, "google/gemma-7b-it");
            } catch (error) {
                console.log('Lỗi với Gemma:', error);
            }
        }
    }

    return comment;
}

async function getRandomPost(postsRef: Reference) {
    const snapshot = await postsRef.once('value');
    const posts = snapshot.val();
    if (!posts) return null;

    const postIds = Object.keys(posts);
    const randomIndex = Math.floor(Math.random() * postIds.length);
    const randomPostId = postIds[randomIndex];
    return { id: randomPostId, ...posts[randomPostId] };
}

export async function GET() {
    try {
        if (!database) {
            throw new Error('Database connection not initialized');
        }

        const postsRef = database.ref('posts');
        let commentInfo = null;
        let likeInfo = null;

        // Xử lý bình luận
        const randomPostForComment = await getRandomPost(postsRef);
        if (randomPostForComment) {
            const commentCharacter = animeCharacters[Math.floor(Math.random() * animeCharacters.length)];
            const comment = await generateComment(randomPostForComment, commentCharacter);

            if (comment) {
                await postsRef.child(`${randomPostForComment.id}/comments`).push({
                    content: comment,
                    characterId: commentCharacter.id,
                    characterName: commentCharacter.name,
                    timestamp: ServerValue.TIMESTAMP
                });

                commentInfo = {
                    postId: randomPostForComment.id,
                    characterName: commentCharacter.name,
                    content: comment
                };
            }
        }

        // Xử lý like
        const randomPostForLike = await getRandomPost(postsRef);
        if (randomPostForLike) {
            await postsRef.child(`${randomPostForLike.id}/likes`).transaction((currentLikes) => {
                return (currentLikes || 0) + 1;
            });

            likeInfo = {
                postId: randomPostForLike.id
            };
        }

        return NextResponse.json({
            success: true,
            interactions: {
                newComment: commentInfo,
                newLike: likeInfo
            }
        });

    } catch (error: any) {
        console.error('Chi tiết lỗi:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Không thể tạo tương tác',
                details: process.env.NODE_ENV === 'development' ? error.toString() : undefined
            },
            { status: 500 }
        );
    }
}