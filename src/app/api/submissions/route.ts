/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from 'next/server';
import { Db, MongoClient } from 'mongodb';
import * as admin from 'firebase-admin';

// Kết nối MongoDB
const uri = process.env.MONGODB_URI;
if (!uri) {
    throw new Error('MONGODB_URI không được định nghĩa trong biến môi trường');
}

const client = new MongoClient(uri, {
    maxPoolSize: 10,
    minPoolSize: 5
});

// Tái sử dụng kết nối database
let database: Db | null = null;
async function connectToDatabase(): Promise<Db> {
    if (!database) {
        await client.connect();
        database = client.db('showai');
    }
    return database;
}

// Khởi tạo Firebase Admin SDK nếu chưa được khởi tạo
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
        })
    });
}

export async function POST(request: Request) {
    try {
        const db = await connectToDatabase();
        const submission = await request.json();

        await db.collection("submissions").insertOne(submission);

        // Gửi thông báo FCM
        try {
            const message = {
                topic: 'all', // Gửi cho những người đăng ký topic 'admin'
                notification: {
                    title: 'Yêu cầu mới',
                    body: 'Có một yêu cầu mới cần được xem xét'
                },
                data: {
                    type: 'new_submission'
                }
            };

            await admin.messaging().send(message);
        } catch (fcmError) {
            console.error('Lỗi khi gửi thông báo FCM:', fcmError);
            // Không throw lỗi để vẫn tiếp tục xử lý API
        }

        return NextResponse.json({ message: "Bài đăng đã được gửi thành công" });
    } catch (error) {
        console.error('Lỗi khi lưu bài đăng:', error);
        return NextResponse.json(
            { error: 'Có lỗi xảy ra khi xử lý bài đăng' },
            { status: 500 }
        );
    }
}

export async function GET(request: Request) {
    try {
        const db = await connectToDatabase();

        const submissions = await db.collection("submissions")
            .find({ status: "pending" })
            .toArray();

        return NextResponse.json({ submissions });
    } catch (error) {
        console.error('Lỗi khi lấy danh sách bài đăng:', error);
        return NextResponse.json(
            { error: 'Có lỗi xảy ra khi lấy danh sách bài đăng' },
            { status: 500 }
        );
    }
}
