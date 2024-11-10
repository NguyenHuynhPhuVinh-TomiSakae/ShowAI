import { NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getDatabase, Database } from 'firebase-admin/database';

// Khởi tạo Firebase Admin
let database: Database | undefined;
try {
    if (!getApps().length) {
        if (!process.env.FIREBASE_DATABASE_URL) {
            throw new Error('FIREBASE_DATABASE_URL chưa được cấu hình');
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
    console.error('Lỗi khởi tạo Firebase:', error);
}

// Ngăn pre-rendering
export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Kiểm tra môi trường để đảm bảo an toàn
        if (process.env.NODE_ENV === 'production') {
            throw new Error('API này chỉ có thể được sử dụng trong môi trường development');
        }

        if (!database) {
            throw new Error('Kết nối database chưa được khởi tạo');
        }

        // Xóa toàn bộ posts
        const postsRef = database.ref('posts');
        await postsRef.remove();

        return NextResponse.json({
            success: true,
            message: 'Đã xóa thành công tất cả bài posts'
        });

    } catch (error: any) {
        console.error('Chi tiết lỗi:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Không thể xóa posts',
                details: process.env.NODE_ENV === 'development' ? error.toString() : undefined
            },
            { status: 500 }
        );
    }
}
