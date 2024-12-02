/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from 'next/server';
import { MongoClient, ObjectId, Db, Sort } from 'mongodb';
import Redis from 'ioredis';
import { gzip, unzip } from 'zlib';
import { promisify } from 'util';

// Thay thế bằng URI kết nối MongoDB Atlas của bạn
const uri = process.env.MONGODB_URI;
if (!uri) {
    throw new Error('MONGODB_URI không được định nghĩa trong biến môi trường');
}

// Tạo pool kết nối MongoDB
const client = new MongoClient(uri, {
    maxPoolSize: 10, // Số lượng kết nối tối đa trong pool
    minPoolSize: 5   // Số lượng kết nối tối thiểu trong pool
});

// Kết nối Redis
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

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

const gzipAsync = promisify(gzip);
const ungzipAsync = promisify(unzip);

// Thêm hàm helper để xóa cache
async function clearCache() {
    const keys = await redis.keys('data:*');
    if (keys.length > 0) {
        await redis.del(...keys);
    }
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);

    // Thêm tham số mới để xóa cache
    const clearCache = searchParams.get('clearCache');

    if (clearCache === 'true') {
        try {
            const keys = await redis.keys('data:*');
            if (keys.length > 0) {
                await redis.del(...keys);
            }
            return createCorsResponse({ message: 'Đã xóa sạch cache Redis' });
        } catch (error) {
            console.error('Lỗi khi xóa cache Redis:', error);
            return createCorsResponse({ error: 'Đã xảy ra lỗi khi xóa cache Redis' }, 500);
        }
    }

    // Lấy các tham số tìm kiếm từ URL
    const searchKeyword = searchParams.get('q') || '';
    const tag = searchParams.get('tag') || '';
    const id = searchParams.get('id') || '';
    const page = searchParams.get('page');
    const itemsPerPage = 8; // Thay đổi từ 9 thành 8
    const random = searchParams.get('random');
    const list = searchParams.get('list');
    const sort = searchParams.get('sort') || '';
    const limit = searchParams.get('limit');

    try {
        const db = await connectToDatabase();
        const collection = db.collection('data_web_ai');

        // Tạo khóa cache dựa trên các tham số tìm kiếm, loại bỏ random
        const cacheKey = `data:${searchKeyword}:${tag}:${id}:${page}:${list}:${sort}:${limit}`;

        let cachedData = null;
        if (!random) {
            const cachedBuffer = await redis.getBuffer(cacheKey);
            if (cachedBuffer) {
                const uncompressedData = await ungzipAsync(cachedBuffer);
                cachedData = JSON.parse(uncompressedData.toString());
            }
        }

        // Tạo query object
        const query: Record<string, unknown> = {};

        if (id) {
            query.id = id;
        }

        if (searchKeyword) {
            query.$or = [
                { name: { $regex: searchKeyword, $options: 'i' } },
                { description: { $elemMatch: { $regex: searchKeyword, $options: 'i' } } },
                { keyFeatures: { $elemMatch: { $regex: searchKeyword, $options: 'i' } } }
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
        } else if (sort === 'evaluation') {
            sortOption = { evaluation: -1 };
        }

        if (cachedData) {
            // Sử dụng dữ liệu cơ bản từ cache
            documents = cachedData.data;
            totalItems = cachedData.pagination?.totalItems;
            totalPages = cachedData.pagination?.totalPages;

            // Lấy thông tin động từ database
            const dynamicFields = ['heart', 'star', 'view', 'evaluation', 'comments', 'shortComments', 'ratings'];
            const dynamicData = await collection.find(
                { id: { $in: documents.map((doc: { id: string }) => doc.id) } },
                { projection: dynamicFields.reduce((acc, field) => ({ ...acc, [field]: 1 }), { id: 1 }) }
            ).toArray();
            // Kết hợp dữ liệu cache với dữ liệu động
            documents = documents.map((doc: any) => {
                const dynamicDoc = dynamicData.find((d: any) => d.id === doc.id);
                return { ...doc, ...dynamicDoc };
            });
        } else {
            // Lấy toàn bộ dữ liệu từ database
            if (random) {
                // Xử lý trường hợp random
                const randomCount = parseInt(random, 10);
                documents = await collection.aggregate([
                    { $match: query },
                    { $sample: { size: randomCount } }
                ]).toArray();
                totalItems = documents.length;
                totalPages = 1;

                // Trả về kết quả ngay lập tức mà không lưu vào cache
                return createCorsResponse({
                    data: documents,
                    pagination: null,
                    tags: await collection.distinct('tags')
                });
            } else if (page) {
                // Xử lý phân trang
                const pageNumber = parseInt(page, 10);
                totalItems = await collection.countDocuments(query);
                totalPages = Math.ceil(totalItems / itemsPerPage);
                documents = await collection.find(query)
                    .sort(sortOption)
                    .skip((pageNumber - 1) * itemsPerPage)
                    .limit(itemsPerPage)
                    .toArray();
            } else if (limit) {
                // Xử lý giới hạn số lượng bản ghi
                const limitCount = parseInt(limit, 10);
                documents = await collection.find(query)
                    .sort(sortOption)
                    .limit(limitCount)
                    .toArray();
                totalItems = documents.length;
                totalPages = 1;
            } else {
                // Lấy toàn bộ dữ liệu
                documents = await collection.find(query).sort(sortOption).toArray();
                totalItems = documents.length;
                totalPages = 1;
            }

            // Lưu dữ liệu cơ bản vào cache (nếu không phải random)
            if (!random) {
                const dataToCache = documents.map(doc => {
                    const { heart, star, view, evaluation, comments, shortComments, ratings, ...rest } = doc;
                    return rest;
                });

                const compressedData = await gzipAsync(JSON.stringify({
                    data: dataToCache,
                    pagination: page ? {
                        currentPage: page ? parseInt(page, 10) : 1,
                        totalPages: totalPages,
                        totalItems: totalItems,
                        itemsPerPage: itemsPerPage
                    } : null,
                    tags: await collection.distinct('tags')
                }));
                await redis.set(cacheKey, compressedData, 'EX', 3600); // Cache trong 1 giờ
            }
        }

        // Trả về dữ liệu đầy đủ cho response
        return createCorsResponse({
            data: documents,
            pagination: page ? {
                currentPage: page ? parseInt(page, 10) : 1,
                totalPages: totalPages,
                totalItems: totalItems,
                itemsPerPage: itemsPerPage
            } : null,
            tags: cachedData ? cachedData.tags : await collection.distinct('tags')
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

        // Thêm các trường mới với giá trị mặc định, bao gồm cả trường image và createdAt
        const newData = {
            ...data,
            heart: 0,
            star: 0,
            view: 0,
            evaluation: 0,
            comments: [],
            shortComments: [],
            image: data.image || '', // Thêm trường image, sử dụng giá trị từ dữ liệu đầu vào hoặc chuỗi rỗng nếu không có
            createdAt: new Date().toISOString() // Thêm trường createdAt với thời gian hiện tại
        };

        const result = await collection.insertOne(newData);

        // Xóa cache sau khi thêm dữ liệu mới
        await clearCache();

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
            return createCorsResponse({ error: 'Không tìm thấy tài liệu với ID đã cung cấp' }, 404);
        }

        // Xóa cache sau khi cập nhật dữ liệu
        await clearCache();

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

        // Xóa cache sau khi xóa dữ liệu
        await clearCache();

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
