import { NextResponse } from 'next/server';
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

export async function GET() {
    try {
        if (!database) {
            throw new Error('Database connection not initialized');
        }

        const groupsRef = database.ref('groups');

        // Tạo group mặc định với các thành viên HTML, CSS và JavaScript
        const defaultGroup = {
            id: "0",
            name: "Web Cơ Bản",
            createdAt: ServerValue.TIMESTAMP,
            memberCount: 3,
            members: {
                "20": {  // HTML
                    id: 20,
                    name: "HTML",
                    personality: "nền tảng và cấu trúc web",
                    joinedAt: ServerValue.TIMESTAMP
                },
                "21": {  // CSS
                    id: 21,
                    name: "CSS",
                    personality: "sáng tạo và thẩm mỹ trong styling",
                    joinedAt: ServerValue.TIMESTAMP
                },
                "1": {   // JavaScript
                    id: 1,
                    name: "JavaScript",
                    personality: "linh hoạt và đa năng, nhưng đôi khi khó đoán",
                    joinedAt: ServerValue.TIMESTAMP
                }
            }
        };

        // Kiểm tra xem group đã tồn tại chưa
        const snapshot = await groupsRef.child('0').once('value');
        if (snapshot.exists()) {
            return NextResponse.json({
                success: true,
                message: 'Group đã tồn tại',
                data: snapshot.val()
            });
        }

        // Tạo mới group nếu chưa tồn tại
        await groupsRef.child('0').set(defaultGroup);

        return NextResponse.json({
            success: true,
            message: 'Tạo group thành công',
            data: defaultGroup
        });

    } catch (error: any) {
        console.error('Chi tiết lỗi:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Không thể tạo group',
                details: process.env.NODE_ENV === 'development' ? error.toString() : undefined
            },
            { status: 500 }
        );
    }
}
