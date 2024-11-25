import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getDatabase, ServerValue, Database } from 'firebase-admin/database';
import { programmingCharacters } from '@/data/programmingCharacters';
import { programmingCharacters2 } from '@/data/programmingCharacters2';

// Kết hợp 2 mảng nhân vật
const allCharacters = [...programmingCharacters, ...programmingCharacters2];

// Cập nhật system prompt để phản ánh vai trò mentor giáo dục
const getSystemPrompt = (character: any) => ({
    role: "system",
    content: `Bạn là ${character.name}, một công nghệ ${character.personality}. 
    Hãy trả lời với vai trò là một mentor giáo dục, giải thích các khái niệm lập trình một cách dễ hiểu 
    và đưa ra các ví dụ thực tế khi phù hợp. Giữ câu trả lời ngắn gọn (dưới 200 ký tự) 
    và phản ánh đặc điểm của công nghệ ${character.name}.`
});

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

async function generateReplyWithGemini(apiKey: string, prompt: string, chatHistory: Array<any>) {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
        model: "gemini-exp-1121",
    });

    try {
        const chat = model.startChat({
            history: chatHistory.map(msg => ({
                role: msg.role,
                parts: [{ text: msg.content }]
            })),
        });

        const result = await chat.sendMessage(prompt);
        const response = await result.response;
        return response.text();
    } catch (error: unknown) {
        console.error('Chi tiết lỗi Gemini:', error);
        if (error instanceof Error) {
            throw new Error(`Lỗi Gemini: ${error.message}`);
        }
        throw new Error('Đã xảy ra lỗi không xác định với Gemini');
    }
}

async function generateReplyWithOpenRouter(apiKey: string, prompt: string, model: string) {
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

// Định nghĩa interface cho ProgrammingCharacter
interface ProgrammingCharacter {
    id: number;
    name: string;
    personality: string;
}

// Định nghĩa interface cho CustomCharacter
interface CustomCharacter {
    id: string;
    name: string;
    personality: string;
    userId: string;
}

// Tạo type union để có thể sử dụng cả hai loại character
type Character = ProgrammingCharacter | CustomCharacter;

export async function GET() {
    try {
        if (!database) {
            throw new Error('Database connection not initialized');
        }

        const profilesRef = database.ref('profiles');
        const profilesSnapshot = await profilesRef.once('value');
        const profiles = profilesSnapshot.val();

        if (!profiles) {
            return NextResponse.json({ success: true, message: 'Không có profile nào cần trả lời' });
        }

        let needsReply = null;
        let profileToReply = null;
        let messageToReplyId = null;

        // Duyệt qua tất cả profiles
        for (const [profileId, profileData] of Object.entries(profiles)) {
            const profile = profileData as any;
            if (!profile.messages) continue;

            // Lấy tin nhắn mới nhất của profile này
            const messages = Object.entries(profile.messages)
                .map(([messageId, message]: [string, any]) => ({
                    id: messageId,
                    ...message
                }))
                .sort((a, b) => b.timestamp - a.timestamp);

            // Nếu tin nhắn mới nhất chưa được trả lời
            if (messages.length > 0 && !messages[0].isReply) {
                needsReply = messages[0];
                profileToReply = profileId;
                messageToReplyId = messages[0].id;
                break;
            }
        }

        // Nếu tìm thấy tin nhắn cần trả lời
        if (needsReply && profileToReply) {
            const profile = profiles[profileToReply];

            // Kiểm tra xem có phải là nhân vật có sẵn không
            let character: Character | undefined = allCharacters.find(
                char => char.id.toString() === profileToReply
            );

            // Nếu không tìm thấy trong danh sách có sẵn, kiểm tra trong database
            if (!character) {
                const customCharactersRef = database.ref('characters');
                const customCharactersSnapshot = await customCharactersRef
                    .child(profileToReply)  // Tìm trực tiếp theo profileId
                    .once('value');

                const customCharacterData = customCharactersSnapshot.val();
                if (customCharacterData) {
                    character = {
                        id: profileToReply,
                        ...customCharacterData
                    } as CustomCharacter;
                }
            }

            if (!character) {
                console.error(`Không tìm thấy nhân vật với profileId ${profileToReply}`);
                return NextResponse.json({
                    success: false,
                    error: 'Không tìm thấy nhân vật'
                });
            }

            // Lấy lịch sử chat và định dạng lại
            const messages = profile.messages || {};
            const chatHistory = Object.entries(messages)
                .map(([, msg]: [string, any]) => ({
                    role: msg.isReply ? "model" : "user",
                    content: msg.content,
                    timestamp: msg.timestamp
                }))
                .sort((a, b) => a.timestamp - b.timestamp)
                .slice(-10); // Lấy 10 tin nhắn gần nhất

            const primaryApiKey = process.env.GEMINI_API_KEY_AI_5;
            const backupApiKey = process.env.GEMINI_API_KEY_AI_6;
            const openRouterKey = process.env.OPENROUTER_API_KEY;

            let reply: string | null = null;

            try {
                if (!primaryApiKey) throw new Error('Primary API key is undefined');
                reply = await generateReplyWithGemini(
                    primaryApiKey,
                    needsReply.content,
                    [getSystemPrompt(character), ...chatHistory]
                );
            } catch (primaryError) {
                console.log('Lỗi với Gemini (tài khoản chính):', primaryError);

                if (backupApiKey) {
                    try {
                        reply = await generateReplyWithGemini(
                            backupApiKey,
                            needsReply.content,
                            [getSystemPrompt(character), ...chatHistory]
                        );
                    } catch (backupError) {
                        console.log('Lỗi với Gemini (tài khoản backup):', backupError);
                    }
                }

                if (!reply && openRouterKey) {
                    try {
                        const openRouterPrompt = `Bạn là ${character.name}, một công nghệ ${character.personality}. 
                                                Với vai trò là mentor giáo dục, hãy trả lời câu hỏi sau một cách ngắn gọn (dưới 200 ký tự), 
                                                dễ hiểu và mang tính giáo dục: "${needsReply.content}"`;
                        reply = await generateReplyWithOpenRouter(
                            openRouterKey,
                            openRouterPrompt,
                            "google/gemma-2-9b-it:free"
                        );
                    } catch (openRouterError: any) {
                        console.log('Lỗi với OpenRouter:', openRouterError);
                        const primaryErrorMessage = (primaryError as Error)?.message || 'Không xác định';
                        const backupErrorMessage = backupApiKey ? 'Không xác định' : 'Không có tài khoản backup';
                        throw new Error(`Không thể tạo câu trả lời. Lỗi Gemini (primary): ${primaryErrorMessage}; Lỗi Gemini (backup): ${backupErrorMessage}; Lỗi OpenRouter: ${openRouterError.message}`);
                    }
                }
            }

            if (!reply) {
                throw new Error('Không thể tạo câu trả lời với bất kỳ model nào');
            }

            // Lưu câu trả lời vào database
            const messagesRef = database.ref(`profiles/${profileToReply}/messages`);
            const newMessage = {
                content: reply,
                timestamp: ServerValue.TIMESTAMP,
                isReply: true,
                userId: character.id.toString()
            };

            const { key: messageId } = await messagesRef.push(newMessage);

            return NextResponse.json({
                success: true,
                response: {
                    profileId: profileToReply,
                    originalMessageId: messageToReplyId,
                    replyMessageId: messageId,
                    reply,
                    character: {
                        id: character.id,
                        name: character.name
                    }
                }
            });
        }

        return NextResponse.json({
            success: true,
            message: 'Không có tin nhắn nào cần trả lời'
        });

    } catch (error: any) {
        console.error('Chi tiết lỗi:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Không thể tạo câu trả lời',
                details: process.env.NODE_ENV === 'development' ? error.toString() : undefined
            },
            { status: 500 }
        );
    }
}
