/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from 'next/server';
import { Db, MongoClient, ObjectId } from 'mongodb';
import * as admin from 'firebase-admin';
import Redis from 'ioredis';

// Kết nối MongoDB
const uri = process.env.MONGODB_URI;
if (!uri) {
    throw new Error('MONGODB_URI không được định nghĩa trong biến môi trường');
}

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

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

// Thêm hàm helper để xóa cache
async function clearCache() {
    const keys = await redis.keys('data:*');
    if (keys.length > 0) {
        await redis.del(...keys);
    }
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

// Hàm helper để tạo response với CORS headers
function createCorsResponse(data: unknown, status = 200) {
    const response = NextResponse.json(data, { status });
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return response;
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
    const url = new URL(request.url);
    const submissionId = url.searchParams.get('_id');
    const action = url.searchParams.get('action'); // Thêm tham số action

    if (submissionId) {
        // Xử lý logic của PATCH khi có submissionId
        if (!ObjectId.isValid(submissionId)) {
            return createCorsResponse(
                { error: 'ID không hợp lệ' },
                400
            );
        }

        const db = await connectToDatabase();
        const submission = await db.collection("submissions").findOne({
            _id: new ObjectId(submissionId)
        });

        if (!submission) {
            return createCorsResponse(
                { error: 'Không tìm thấy bài đăng' },
                404
            );
        }

        // Lấy toàn bộ dữ liệu từ showai để tính maxId
        const allData = await db.collection("data_web_ai").find().toArray();
        const maxId = allData.reduce((max, doc) => {
            const id = parseInt(doc.id, 10) || 0;
            return id > max ? id : max;
        }, 0);
        const newId = (maxId + 1).toString(); // Chuyển đổi id mới thành chuỗi

        const { _id, status, ...submissionData } = submission;
        const newData = {
            ...submissionData,
            id: newId, // Gán id mới
            heart: 0,
            star: 0,
            view: 0,
            evaluation: 0,
            comments: [],
            shortComments: [],
            image: submission.image || '',
            createdAt: new Date().toISOString()
        };

        // Kiểm tra action trước khi thêm vào data_web_ai
        if (action === 'add') {
            await db.collection("data_web_ai").insertOne(newData);
        }
        // Luôn xóa submission bất kể action là gì
        await db.collection("submissions").deleteOne({
            _id: new ObjectId(submissionId)
        });

        // Xóa cache chỉ khi thêm dữ liệu mới
        if (action === 'add') {
            await clearCache();
        }

        return createCorsResponse({
            message: action === 'add' ? "Đã chuyển bài đăng thành công" : "Đã xóa bài đăng thành công",
            data: action === 'add' ? newData : null
        });
    } else {
        // Xử lý logic của GET khi không có submissionId
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
}

export async function OPTIONS() {
    return createCorsResponse(null, 204);
}
