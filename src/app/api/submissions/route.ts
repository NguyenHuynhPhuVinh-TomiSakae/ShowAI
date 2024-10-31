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

// Thêm hàm helper để gửi email thông báo
async function sendNotificationEmails(name: string) {
    try {
        const db = await connectToDatabase();
        const emails = await db.collection("emails").find().toArray();

        for (const emailDoc of emails) {
            try {
                await admin.auth().generatePasswordResetLink(emailDoc.email, {
                    url: `${process.env.NEXT_PUBLIC_BASE_URL}/ai/${name}`,
                    handleCodeInApp: true,
                });
                console.log(`Đã gửi thông báo đến ${emailDoc.email}`);
            } catch (error) {
                console.error(`Lỗi khi gửi email đến ${emailDoc.email}:`, error);
            }
        }
    } catch (error) {
        console.error('Lỗi khi gửi thông báo email:', error);
    }
}

// Thêm hàm helper để xóa ảnh từ Storage
async function deleteImageFromStorage(imageUrl: string) {
    try {
        if (!imageUrl) return;

        // Lấy đường dẫn file từ URL
        const filePathMatch = imageUrl.match(/o\/(.*?)\?/);
        if (!filePathMatch) return;

        const filePath = decodeURIComponent(filePathMatch[1]);
        const bucket = admin.storage().bucket(process.env.FIREBASE_STORAGE_BUCKET);
        const file = bucket.file(filePath);

        await file.delete();
        console.log('Đã xóa ảnh thành công:', filePath);
    } catch (error) {
        console.error('Lỗi khi xóa ảnh:', error);
    }
}

export async function POST(request: Request) {
    try {
        const db = await connectToDatabase();
        const submission = await request.json();

        await db.collection("submissions").insertOne(submission);

        // Gửi thông báo FCM với thông tin chính xác từ submission
        try {
            const message = {
                topic: 'all',
                notification: {
                    title: 'Yêu cầu đăng bài mới',
                    body: `${submission.name || 'Không có tên'} - ${submission.displayName || 'Không có người gửi'}`
                },
                data: {
                    type: 'new_submission',
                    name: submission.name || '',
                    displayName: submission.displayName || '',
                    submissionId: submission._id?.toString() || '',
                    image: submission.image || '',
                    submittedAt: submission.submittedAt || ''
                }
            };

            await admin.messaging().send(message);
        } catch (fcmError) {
            console.error('Lỗi khi gửi thông báo FCM:', fcmError);
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

// Thêm endpoint PATCH mới để xử lý việc chuyển/xóa submission
export async function PATCH(request: Request) {
    try {
        const { submissionId, action } = await request.json();

        if (!submissionId || !ObjectId.isValid(submissionId)) {
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
        const newId = (maxId + 1).toString();

        const { _id, status, name, displayName, ...submissionData } = submission;
        const newData = {
            name,
            displayName,
            ...submissionData,
            id: newId,
            heart: 0,
            star: 0,
            view: 0,
            evaluation: 0,
            comments: [],
            shortComments: [],
            image: submission.image || '',
            createdAt: new Date().toISOString()
        };

        if (action === 'add') {
            await db.collection("data_web_ai").insertOne(newData);

            // Thêm thông báo FCM mới
            try {
                const message = {
                    topic: 'new',
                    notification: {
                        title: 'Website mới trên ShowAI',
                        body: `${newData.name} đã được thêm vào ShowAI`
                    },
                    data: {
                        type: 'new',
                        name: newData.name,
                        displayName: newData.displayName,
                    }
                };

                await admin.messaging().send(message);
            } catch (fcmError) {
                console.error('Lỗi khi gửi thông báo FCM:', fcmError);
            }

            await sendNotificationEmails(newData.id);
        } else {
            // Xóa ảnh khi từ chối bài đăng
            if (submission.image) {
                await deleteImageFromStorage(submission.image);
            }
        }

        await db.collection("submissions").deleteOne({
            _id: new ObjectId(submissionId)
        });

        if (action === 'add') {
            await clearCache();
        }

        return createCorsResponse({
            message: action === 'add' ? "Đã chuyển bài đăng thành công" : "Đã xóa bài đăng thành công",
            data: action === 'add' ? newData : null
        });
    } catch (error) {
        console.error('Lỗi khi xử lý yêu cầu:', error);
        return createCorsResponse(
            { error: 'Có lỗi xảy ra khi xử lý yêu cầu' },
            500
        );
    }
}

export async function OPTIONS() {
    return createCorsResponse(null, 204);
}
