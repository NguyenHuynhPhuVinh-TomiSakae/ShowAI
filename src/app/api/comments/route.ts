
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

        if (comment.parentId) {
            // Nếu là câu trả lời, thêm vào mảng replies của bình luận cha
            const result = await collection.updateOne(
                { id: websiteId, "comments.id": comment.parentId },
                { $push: { "comments.$.replies": newComment } }
            );

            if (result.matchedCount === 0) {
                return createCorsResponse({ error: 'Không tìm thấy bình luận cha' }, 404);
            }
        } else {
            // Nếu là bình luận gốc, thêm vào mảng comments
            const result = await collection.updateOne(
                { id: websiteId },
                { $push: { comments: newComment } }
            );

            if (result.matchedCount === 0) {
                return createCorsResponse({ error: 'Không tìm thấy website' }, 404);
            }
        }

        return createCorsResponse({ success: true, comment: newComment });
    } catch (error) {
        console.error('Lỗi khi thêm bình luận:', error);
        return createCorsResponse({ error: 'Lỗi server' }, 500);
    }
}

export async function PUT(request: Request) {
    const { websiteId, commentId, parentId, replyId, text } = await request.json();

    if (!websiteId || !text || (!commentId && (!parentId || !replyId))) {
        return createCorsResponse({ error: 'Thiếu thông tin cần thiết' }, 400);
    }

    try {
        const db = await connectToDatabase();
        const collection = db.collection('data_web_ai');

        let result;
        if (commentId) {
            // Cập nhật bình luận gốc
            result = await collection.updateOne(
                { id: websiteId, "comments.id": commentId },
                { $set: { "comments.$.text": text, "comments.$.editedAt": new Date().toISOString() } }
            );
        } else {
            // Cập nhật câu trả lời
            result = await collection.updateOne(
                { id: websiteId, "comments.id": parentId, "comments.replies.id": replyId },
                { $set: { "comments.$[comment].replies.$[reply].text": text, "comments.$[comment].replies.$[reply].editedAt": new Date().toISOString() } },
                { arrayFilters: [{ "comment.id": parentId }, { "reply.id": replyId }] }
            );
        }

        if (result.matchedCount === 0) {
            return createCorsResponse({ error: 'Không tìm thấy bình luận hoặc câu trả lời' }, 404);
        }

        return createCorsResponse({ success: true });
    } catch (error) {
        console.error('Lỗi khi cập nhật bình luận hoặc câu trả lời:', error);
        return createCorsResponse({ error: 'Lỗi server' }, 500);
    }
}

export async function DELETE(request: Request) {
    const { websiteId, commentId, parentId, replyId } = await request.json();

    if (!websiteId || (!commentId && (!parentId || !replyId))) {
        return createCorsResponse({ error: 'Thiếu thông tin cần thiết' }, 400);
    }

    try {
        const db = await connectToDatabase();
        const collection = db.collection('data_web_ai');

        let result;
        if (commentId) {
            // Xóa bình luận gốc
            result = await collection.updateOne(
                { id: websiteId },
                { $pull: { comments: { id: commentId } } } as any
            );
        } else {
            // Xóa câu trả lời
            result = await collection.updateOne(
                { id: websiteId, "comments.id": parentId },
                { $pull: { "comments.$.replies": { id: replyId } } } as any
            );
        }

        if (result.matchedCount === 0) {
            return createCorsResponse({ error: 'Không tìm thấy bình luận hoặc câu trả lời' }, 404);
        }

        return createCorsResponse({ success: true });
    } catch (error) {
        console.error('Lỗi khi xóa bình luận hoặc câu trả lời:', error);
        return createCorsResponse({ error: 'Lỗi server' }, 500);
    }
}

export async function OPTIONS() {
    return createCorsResponse(null, 204);
}
