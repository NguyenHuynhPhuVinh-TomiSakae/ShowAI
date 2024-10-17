
import { NextResponse } from 'next/server';
import { MongoClient, Db, ObjectId } from 'mongodb';

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
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return response;
}

export async function POST(request: Request) {
    const { websiteId, comment } = await request.json();

    if (!websiteId || !comment || comment.trim().split(/\s+/).length > 20) {
        return createCorsResponse({ error: 'websiteId là bắt buộc và bình luận không được quá 20 từ' }, 400);
    }

    try {
        const db = await connectToDatabase();
        const collection = db.collection('data_web_ai');

        const newShortComment = {
            id: new ObjectId().toString(),
            text: comment.trim(),
            date: new Date().toISOString()
        };

        const result = await collection.updateOne(
            { id: websiteId },
            { $push: { shortComments: newShortComment } } as any
        );

        if (result.matchedCount === 0) {
            return createCorsResponse({ error: 'Không tìm thấy website' }, 404);
        }

        return createCorsResponse({ success: true, comment: newShortComment });
    } catch (error) {
        console.error('Lỗi khi thêm bình luận ngắn:', error);
        return createCorsResponse({ error: 'Lỗi server' }, 500);
    }
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const websiteId = searchParams.get('websiteId');

    if (!websiteId) {
        return createCorsResponse({ error: 'websiteId là bắt buộc' }, 400);
    }

    try {
        const db = await connectToDatabase();
        const collection = db.collection('data_web_ai');

        const website = await collection.findOne({ id: websiteId });
        if (!website) {
            return createCorsResponse({ error: 'Không tìm thấy website' }, 404);
        }

        return createCorsResponse({ success: true, shortComments: website.shortComments || [] });
    } catch (error) {
        console.error('Lỗi khi lấy bình luận ngắn:', error);
        return createCorsResponse({ error: 'Lỗi server' }, 500);
    }
}

export async function OPTIONS() {
    return createCorsResponse(null, 204);
}
