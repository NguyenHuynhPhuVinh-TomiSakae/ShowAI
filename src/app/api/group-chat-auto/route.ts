import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getDatabase, ServerValue, Database } from 'firebase-admin/database';

interface Character {
    id: number;
    name: string;
    personality: string;
}

interface Message {
    content: string;
    timestamp: number;
    userId: string;
    userName?: string;
}

interface ChatMessage {
    role: string;
    content: string;
}

// Định nghĩa 3 nhân vật cố định
const groupCharacters: Character[] = [
    {
        id: 20,
        name: "HTML",
        personality: "nền tảng và cấu trúc web"
    },
    {
        id: 21,
        name: "CSS",
        personality: "sáng tạo và thẩm mỹ trong styling"
    },
    {
        id: 1,
        name: "JavaScript",
        personality: "linh hoạt và đa năng, nhưng đôi khi khó đoán"
    }
];

const getSystemPrompt = (character: Character): ChatMessage => ({
    role: "user",
    content: `Bạn là ${character.name}, một công nghệ ${character.personality}. 
    Hãy tham gia vào cuộc trò chuyện với vai trò là một mentor giáo dục.
    Dựa vào nội dung cuộc trò chuyện trước đó (nếu có), hãy đưa ra ý kiến hoặc bổ sung thông tin.
    Giữ câu trả lời ngắn gọn (dưới 200 ký tự) và thể hiện đặc trưng của ${character.name}.`
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

async function generateMessage(apiKey: string, character: Character, previousMessages: Message[]): Promise<string> {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-exp-1121" });

    // Chuyển đổi tin nhắn trước đó thành format phù hợp
    const chatHistory: ChatMessage[] = previousMessages.map(msg => ({
        role: "user",
        content: `${msg.userName}: ${msg.content}`
    }));

    // Thêm system prompt vào đầu lịch sử
    const fullHistory: ChatMessage[] = [
        getSystemPrompt(character),
        ...chatHistory,
        {
            role: "user",
            content: "Hãy đưa ra phản hồi của bạn về cuộc trò chuyện trên, dựa trên vai trò của bạn."
        }
    ];

    try {
        const result = await model.generateContent(fullHistory.map(msg => msg.content).join("\n\n"));
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('Lỗi Gemini:', error);
        throw error;
    }
}

export async function GET() {
    try {
        if (!database) {
            throw new Error('Database connection not initialized');
        }

        // Lấy 5 tin nhắn gần nhất từ group
        const messagesRef = database.ref('groups/0/messages');
        const snapshot = await messagesRef.orderByChild('timestamp').limitToLast(5).once('value');
        const previousMessages: Message[] = [];

        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                const message = childSnapshot.val();
                const character = groupCharacters.find(c => c.id.toString() === message.userId);
                previousMessages.push({
                    ...message,
                    userName: character?.name || 'Unknown'
                });
            });
        }

        // Chọn ngẫu nhiên một nhân vật khác với người gửi tin nhắn cuối cùng
        let randomCharacter: Character;
        if (previousMessages.length > 0) {
            const lastMessageUserId = previousMessages[previousMessages.length - 1].userId;
            const availableCharacters = groupCharacters.filter(c => c.id.toString() !== lastMessageUserId);
            randomCharacter = availableCharacters[Math.floor(Math.random() * availableCharacters.length)];
        } else {
            randomCharacter = groupCharacters[Math.floor(Math.random() * groupCharacters.length)];
        }

        // Tạo tin nhắn với Gemini
        const primaryApiKey = process.env.GEMINI_API_KEY_AI_9;
        const backupApiKey = process.env.GEMINI_API_KEY_AI_10;

        let message: string | null = null;

        try {
            if (!primaryApiKey) throw new Error('Primary API key is undefined');
            message = await generateMessage(primaryApiKey, randomCharacter, previousMessages);
        } catch (primaryError) {
            console.log('Lỗi với tài khoản chính:', primaryError);

            if (backupApiKey) {
                try {
                    message = await generateMessage(backupApiKey, randomCharacter, previousMessages);
                } catch (backupError) {
                    console.log('Lỗi với tài khoản backup:', backupError);
                    throw backupError;
                }
            }
        }

        if (!message) {
            throw new Error('Không thể tạo tin nhắn');
        }

        // Lưu tin nhắn vào group
        const newMessage = {
            content: message,
            timestamp: ServerValue.TIMESTAMP,
            userId: randomCharacter.id.toString()
        };

        const { key: messageId } = await messagesRef.push(newMessage);

        return NextResponse.json({
            success: true,
            response: {
                messageId,
                message,
                character: {
                    id: randomCharacter.id,
                    name: randomCharacter.name
                }
            }
        });

    } catch (error: any) {
        console.error('Chi tiết lỗi:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Không thể tạo tin nhắn tự động',
                details: process.env.NODE_ENV === 'development' ? error.toString() : undefined
            },
            { status: 500 }
        );
    }
}
