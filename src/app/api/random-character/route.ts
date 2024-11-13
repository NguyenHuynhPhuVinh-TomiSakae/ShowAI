import { NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getDatabase, Database } from 'firebase-admin/database';

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

export async function GET() {
    try {
        if (!database) {
            throw new Error('Database connection not initialized');
        }

        // Lấy tất cả characters từ database
        const charactersRef = database.ref('characters');
        const snapshot = await charactersRef.once('value');
        const characters = snapshot.val();

        if (!characters) {
            throw new Error('Không tìm thấy nhân vật nào trong database');
        }

        // Chuyển đổi object thành array và thêm id
        const characterArray = Object.entries(characters).map(([id, data]: [string, any]) => ({
            id,
            ...data
        }));

        if (characterArray.length === 0) {
            throw new Error('Không có nhân vật nào trong database');
        }

        // Chọn ngẫu nhiên một nhân vật
        const randomIndex = Math.floor(Math.random() * characterArray.length);
        const randomCharacter = characterArray[randomIndex];

        return NextResponse.json({
            success: true,
            character: {
                id: randomCharacter.id,
                name: randomCharacter.name,
                personality: randomCharacter.personality,
                userId: randomCharacter.userId,
                userName: randomCharacter.userName
            }
        });

    } catch (error: any) {
        console.error('Chi tiết lỗi:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Không thể lấy nhân vật ngẫu nhiên',
                details: process.env.NODE_ENV === 'development' ? error.toString() : undefined
            },
            { status: 500 }
        );
    }
}
