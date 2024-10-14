import { NextResponse } from 'next/server';
import { MongoClient, ObjectId, Db, Sort } from 'mongodb';

// Thay thế bằng URL kết nối MongoDB Atlas của bạn
const uri = process.env.MONGODB_URI;
if (!uri) {
    throw new Error('MONGODB_URI is not defined in the environment variables');
}

// Tạo một instance của MongoClient để tái sử dụng
const client = new MongoClient(uri);

// Kết nối đến database một lần và tái sử dụng
let database: Db | null = null;
async function connectToDatabase(): Promise<Db> {
    if (!database) {
        await client.connect();
        database = client.db('showai');
    }
    return database;
}

// Hàm helper để tạo response với CORS headers
function createCorsResponse(data: unknown, status = 200) {
    const response = NextResponse.json(data, { status });
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return response;
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);

    // Lấy các tham số tìm kiếm từ URL
    const searchKeyword = searchParams.get('q') || '';
    const tag = searchParams.get('tag') || '';
    const id = searchParams.get('id') || '';
    const page = searchParams.get('page');
    const itemsPerPage = 9;
    const random = searchParams.get('random');
    const list = searchParams.get('list');
    const sort = searchParams.get('sort') || '';
    const limit = searchParams.get('limit');

    try {
        const db = await connectToDatabase();
        const collection = db.collection('data_web_ai');

        // Tạo query object
        const query: Record<string, unknown> = {};

        if (id) {
            query.id = id;
        }

        if (searchKeyword) {
            query.$or = [
                { name: { $regex: searchKeyword, $options: 'i' } },
                { description: { $elemMatch: { $regex: searchKeyword, $options: 'i' } } }
            ];
        }

        if (tag) {
            query.tags = { $elemMatch: { $regex: tag, $options: 'i' } };
        }

        if (list) {
            const listIds = list.split(',').map(id => id.trim());
            query.id = { $in: listIds };
        }

        let documents;
        let totalItems;
        let totalPages;

        // Xác định cách sắp xếp
        let sortOption: Sort = { _id: -1 };
        if (sort === 'heart') {
            sortOption = { heart: -1 };
        } else if (sort === 'view') {
            sortOption = { view: -1 };
        } else if (sort === 'star') {
            sortOption = { star: -1 };
        }

        if (random) {
            // Nếu có tham số random, lấy ngẫu nhiên số lượng bản ghi theo giá trị random
            const randomCount = parseInt(random, 10);
            documents = await collection.aggregate([
                { $match: query },
                { $sample: { size: randomCount } }
            ]).toArray();
            totalItems = documents.length;
            totalPages = 1;
        } else if (page) {
            // Nếu có tham số page, thực hiện phân trang
            const pageNumber = parseInt(page, 10);
            totalItems = await collection.countDocuments(query);
            totalPages = Math.ceil(totalItems / itemsPerPage);
            documents = await collection.find(query)
                .sort(sortOption)
                .skip((pageNumber - 1) * itemsPerPage)
                .limit(itemsPerPage)
                .toArray();
        } else if (limit) {
            // Nếu có tham số limit, hiển thị số lượng bản ghi theo giá trị limit
            const limitCount = parseInt(limit, 10);
            documents = await collection.find(query)
                .sort(sortOption)
                .limit(limitCount)
                .toArray();
            totalItems = documents.length;
            totalPages = 1;
        } else {
            // Nếu không có tham số page, random hoặc limit, lấy toàn bộ dữ liệu
            documents = await collection.find(query).sort(sortOption).toArray();
            totalItems = documents.length;
            totalPages = 1;
        }

        // Tổng hợp toàn bộ tag
        const allTags = await collection.distinct('tags');

        // Sử dụng hàm helper để tạo response
        return createCorsResponse({
            data: documents,
            pagination: page ? {
                currentPage: page ? parseInt(page, 10) : 1,
                totalPages: totalPages,
                totalItems: totalItems,
                itemsPerPage: itemsPerPage
            } : null,
            tags: allTags
        });
    } catch (error) {
        console.error('Lỗi khi truy vấn MongoDB:', error);
        return createCorsResponse({ error: 'Đã xảy ra lỗi khi truy vấn dữ liệu' }, 500);
    }
}

export async function POST(request: Request) {
    const data = await request.json();

    try {
        const db = await connectToDatabase();
        const collection = db.collection('data_web_ai');

        // Thêm các trường mới với giá trị mặc định
        const newData = {
            ...data,
            heart: 0,
            star: 0,
            view: 0,
            evaluation: 0,
            comments: []
        };

        const result = await collection.insertOne(newData);

        return createCorsResponse({ success: true, id: result.insertedId });
    } catch (error) {
        console.error('Lỗi khi thêm dữ liệu:', error);
        return createCorsResponse({ error: 'Đã xảy ra lỗi khi thêm dữ liệu' }, 500);
    }
}

export async function PUT(request: Request) {
    const { _id, id, ...updateData } = await request.json();

    try {
        const db = await connectToDatabase();
        const collection = db.collection('data_web_ai');

        let query;
        if (_id) {
            query = { _id: new ObjectId(_id) };
        } else if (id) {
            query = { id: id };
        } else {
            throw new Error('No valid ID provided for update');
        }

        const result = await collection.updateOne(query, { $set: updateData });

        if (result.matchedCount === 0) {
            return createCorsResponse({ error: 'No document found with the provided ID' }, 404);
        }

        return createCorsResponse({ success: true, modifiedCount: result.modifiedCount });
    } catch (error) {
        console.error('Lỗi khi cập nhật dữ liệu:', error);
        return createCorsResponse({ error: 'Đã xảy ra lỗi khi cập nhật dữ liệu' }, 500);
    }
}

export async function DELETE(request: Request) {
    const { id } = await request.json();

    try {
        const db = await connectToDatabase();
        const collection = db.collection('data_web_ai');

        const result = await collection.deleteOne({ _id: new ObjectId(id) });

        return createCorsResponse({ success: true, deletedCount: result.deletedCount });
    } catch (error) {
        console.error('Lỗi khi xóa dữ liệu:', error);
        return createCorsResponse({ error: 'Đã xảy ra lỗi khi xóa dữ liệu' }, 500);
    }
}

// Xử lý OPTIONS request cho preflight
export async function OPTIONS() {
    return createCorsResponse(null, 204);
}
