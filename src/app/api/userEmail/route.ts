import { NextResponse } from 'next/server';
import { MongoClient, Db } from 'mongodb';

const uri = process.env.MONGODB_URI;
if (!uri) {
    throw new Error('MONGODB_URI không được định nghĩa trong biến môi trường');
}

const client = new MongoClient(uri);

let database: Db | null = null;
async function connectToDatabase(): Promise<Db> {
    if (!database) {
        await client.connect();
        database = client.db('showai');
    }
    return database;
}

function createCorsResponse(data: unknown, status = 200) {
    const response = NextResponse.json(data, { status });
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'POST, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return response;
}

export async function POST(request: Request) {
    const { userId, email } = await request.json();

    if (!userId || !email) {
        return createCorsResponse({ error: 'userId và email là bắt buộc' }, 400);
    }

    try {
        const db = await connectToDatabase();
        const collection = db.collection('emails');

        const result = await collection.updateOne(
            { userId },
            { $set: { email, updatedAt: new Date() } },
            { upsert: true }
        );

        return createCorsResponse({ success: true, result });
    } catch (error) {
        console.error('Lỗi khi lưu email:', error);
        return createCorsResponse({ error: 'Lỗi server' }, 500);
    }
}

export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
        return createCorsResponse({ error: 'userId là bắt buộc' }, 400);
    }

    try {
        const db = await connectToDatabase();
        const collection = db.collection('emails');

        const result = await collection.deleteOne({ userId });

        if (result.deletedCount === 0) {
            return createCorsResponse({ error: 'Không tìm thấy email để xóa' }, 404);
        }

        return createCorsResponse({ success: true, result });
    } catch (error) {
        console.error('Lỗi khi xóa email:', error);
        return createCorsResponse({ error: 'Lỗi server' }, 500);
    }
}

export async function OPTIONS() {
    return createCorsResponse(null, 204);
}
