import { NextResponse } from 'next/server';
import { MongoClient, Db, ObjectId, PullOperator } from 'mongodb';

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

        return createCorsResponse({ success: true, comments: website.comments || [] });
    } catch (error) {
        console.error('Lỗi khi lấy bình luận:', error);
        return createCorsResponse({ error: 'Lỗi server' }, 500);
    }
}

export async function POST(request: Request) {
    const { websiteId, comment } = await request.json();

    if (!websiteId || !comment) {
        return createCorsResponse({ error: 'websiteId và comment là bắt buộc' }, 400);
    }

    try {
        const db = await connectToDatabase();
        const collection = db.collection('data_web_ai');

        const newComment = {
            id: new ObjectId().toString(),
            ...comment,
            date: new Date().toISOString()
        };

        const result = await collection.updateOne(
            { id: websiteId },
            { $push: { comments: newComment } }
        );

        if (result.matchedCount === 0) {
            return createCorsResponse({ error: 'Không tìm thấy website' }, 404);
        }

        return createCorsResponse({ success: true, comment: newComment });
    } catch (error) {
        console.error('Lỗi khi thêm bình luận:', error);
        return createCorsResponse({ error: 'Lỗi server' }, 500);
    }
}

export async function PUT(request: Request) {
    const { websiteId, commentId, text } = await request.json();

    if (!websiteId || !commentId || !text) {
        return createCorsResponse({ error: 'websiteId, commentId và text là bắt buộc' }, 400);
    }

    try {
        const db = await connectToDatabase();
        const collection = db.collection('data_web_ai');

        const result = await collection.updateOne(
            { id: websiteId, "comments.id": commentId },
            { $set: { "comments.$.text": text, "comments.$.editedAt": new Date().toISOString() } }
        );

        if (result.matchedCount === 0) {
            return createCorsResponse({ error: 'Không tìm thấy website hoặc bình luận' }, 404);
        }

        return createCorsResponse({ success: true });
    } catch (error) {
        console.error('Lỗi khi cập nhật bình luận:', error);
        return createCorsResponse({ error: 'Lỗi server' }, 500);
    }
}

export async function DELETE(request: Request) {
    const { websiteId, commentId } = await request.json();

    if (!websiteId || !commentId) {
        return createCorsResponse({ error: 'websiteId và commentId là bắt buộc' }, 400);
    }

    try {
        const db = await connectToDatabase();
        const collection = db.collection('data_web_ai');

        const pullOperation: PullOperator<Document> = {
            $pull: { comments: { id: commentId } }
        };

        const result = await collection.updateOne(
            { id: websiteId },
            pullOperation
        );

        if (result.matchedCount === 0) {
            return createCorsResponse({ error: 'Không tìm thấy website' }, 404);
        }

        return createCorsResponse({ success: true });
    } catch (error) {
        console.error('Lỗi khi xóa bình luận:', error);
        return createCorsResponse({ error: 'Lỗi server' }, 500);
    }
}

export async function OPTIONS() {
    return createCorsResponse(null, 204);
}
