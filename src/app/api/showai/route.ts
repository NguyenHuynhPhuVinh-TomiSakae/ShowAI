/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import NodeCache from 'node-cache';

// Cấu hình kết nối MySQL sử dụng URL từ Railway
const dbUrl = process.env.MYSQL_URL || '';
const dbConfig = new URL(dbUrl);

// Tạo pool kết nối
const pool = mysql.createPool({
    host: dbConfig.hostname,
    user: dbConfig.username,
    password: dbConfig.password,
    database: dbConfig.pathname.substr(1),
    port: Number(dbConfig.port),
    ssl: {
        rejectUnauthorized: false
    },
    connectionLimit: 20,
    queueLimit: 0,
});

// Tạo một cache instance
const cache = new NodeCache({ stdTTL: 3600 }); // Cache trong 1 giờ thay vì 10 phút

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
    const cacheKey = searchParams.toString();

    // Kiểm tra cache trước
    const cachedResult = cache.get(cacheKey);
    if (cachedResult) {
        return createCorsResponse(cachedResult);
    }

    // Lấy các tham số tìm kiếm từ URL
    const searchKeyword = searchParams.get('q') || '';
    const tag = searchParams.get('tag') || '';
    const id = searchParams.get('id') || '';
    const page = searchParams.get('page');
    const itemsPerPage = 9;
    const random = searchParams.get('random');
    const list = searchParams.get('list');
    const limit = searchParams.get('limit');
    const sort = searchParams.get('sort') || '';

    try {
        // Tạo câu truy vấn SQL cơ bản
        let query = 'SELECT SQL_CALC_FOUND_ROWS * FROM showai_data USE INDEX (primary) WHERE 1=1';
        const queryParams: any[] = [];

        if (id) {
            query += ' AND id = ?';
            queryParams.push(id);
        }

        if (searchKeyword) {
            query += ' AND (name LIKE ? OR description LIKE ?)';
            queryParams.push(`%${searchKeyword}%`, `%${searchKeyword}%`);
        }

        if (tag) {
            query += ' AND (tags LIKE ? OR FIND_IN_SET(?, tags) > 0)';
            queryParams.push(`%${tag}%`, tag);
        }

        if (list) {
            const listIds = list.split(',').map(id => id.trim());
            query += ` AND id IN (${listIds.map(() => '?').join(',')})`;
            queryParams.push(...listIds);
        }

        // Xử lý truy vấn ngẫu nhiên
        if (random) {
            const randomCount = parseInt(random, 10);
            query += ' ORDER BY RAND() LIMIT ?';
            queryParams.push(randomCount);
        } else {
            // Xử lý sắp xếp nếu không có yêu cầu ngẫu nhiên
            if (sort) {
                const validSortFields = ['heart', 'star', 'view', 'evaluation'];
                if (validSortFields.includes(sort)) {
                    query += ` ORDER BY ${sort} DESC, id DESC`;
                } else {
                    query += ' ORDER BY id DESC';
                }
            } else {
                query += ' ORDER BY id DESC';
            }

            // Xử lý phân trang hoặc giới hạn
            if (page) {
                const pageNumber = parseInt(page, 10);
                const offset = (pageNumber - 1) * itemsPerPage;
                query += ' LIMIT ? OFFSET ?';
                queryParams.push(itemsPerPage, offset);
            } else if (limit) {
                query += ' LIMIT ?';
                queryParams.push(parseInt(limit, 10));
            }
        }

        console.log('Query cuối cùng:', query);
        console.log('Params cuối cùng:', queryParams);

        // Thực hiện truy vấn chính và đếm tổng số bản ghi cùng lúc
        const [rows] = await pool.query(query, queryParams);
        const [countResult] = await pool.query('SELECT FOUND_ROWS() as count');
        const totalItems = (countResult as any)[0].count;

        // Log kết quả để kiểm tra
        console.log('Kết quả truy vấn:', rows);

        // Lấy tất cả các tag duy nhất
        const [tags] = await pool.query(`
            SELECT DISTINCT tag
            FROM (
                SELECT TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(tags, ',', numbers.n), ',', -1)) AS tag
                FROM 
                    (SELECT 1 n UNION ALL SELECT 2
                     UNION ALL SELECT 3 UNION ALL SELECT 4
                     UNION ALL SELECT 5) numbers
                INNER JOIN showai_data
                WHERE n <= 1 + (LENGTH(tags) - LENGTH(REPLACE(tags, ',', '')))
            ) AS subquery
            WHERE tag != ''
        `);

        const result = {
            data: rows,
            pagination: page ? {
                currentPage: page ? parseInt(page, 10) : 1,
                totalPages: Math.ceil(totalItems / itemsPerPage),
                totalItems: totalItems,
                itemsPerPage: itemsPerPage
            } : null,
            tags: (tags as any[]).map(t => t.tag)
        };

        // Lưu kết quả vào cache
        cache.set(cacheKey, result);

        return createCorsResponse(result);
    } catch (error) {
        console.error('Lỗi khi truy vấn MySQL:', error);
        return createCorsResponse({ error: 'Đã xảy ra lỗi khi truy vấn dữ liệu', details: error }, 500);
    }
}

export async function POST(request: Request) {
    const data = await request.json();

    try {
        // Thêm các trường mới với giá trị mặc định
        const newData = {
            ...data,
            heart: 0,
            star: 0,
            view: 0,
            evaluation: 0,
            comments: JSON.stringify([]),
            shortComments: JSON.stringify([])
        };

        const [result] = await pool.execute('INSERT INTO showai_data SET ?', [newData]);
        const insertId = (result as mysql.ResultSetHeader).insertId;

        // Cập nhật cache khi có thay đổi dữ liệu
        invalidateCache();

        return createCorsResponse({ success: true, id: insertId });
    } catch (error) {
        console.error('Lỗi khi thêm dữ liệu:', error);
        return createCorsResponse({ error: 'Đã xảy ra lỗi khi thêm dữ liệu' }, 500);
    }
}

export async function PUT(request: Request) {
    const { id, ...updateData } = await request.json();

    try {
        if (!id) {
            throw new Error('Không có ID hợp lệ để cập nhật');
        }

        const [result] = await pool.execute('UPDATE showai_data SET ? WHERE id = ?', [updateData, id]);
        const affectedRows = (result as mysql.ResultSetHeader).affectedRows;

        if (affectedRows === 0) {
            return createCorsResponse({ error: 'Không tìm thấy bản ghi với ID đã cung cấp' }, 404);
        }

        // Cập nhật cache khi có thay đổi dữ liệu
        invalidateCache();

        return createCorsResponse({ success: true, modifiedCount: affectedRows });
    } catch (error) {
        console.error('Lỗi khi cập nhật dữ liệu:', error);
        return createCorsResponse({ error: 'Đã xảy ra lỗi khi cập nhật dữ liệu' }, 500);
    }
}

export async function DELETE(request: Request) {
    const { id } = await request.json();

    try {
        const [result] = await pool.execute('DELETE FROM showai_data WHERE id = ?', [id]);
        const affectedRows = (result as mysql.ResultSetHeader).affectedRows;

        // Cập nhật cache khi có thay đổi dữ liệu
        invalidateCache();

        return createCorsResponse({ success: true, deletedCount: affectedRows });
    } catch (error) {
        console.error('Lỗi khi xóa dữ liệu:', error);
        return createCorsResponse({ error: 'Đã xảy ra lỗi khi xóa dữ liệu' }, 500);
    }
}

// Xử lý OPTIONS request cho preflight
export async function OPTIONS() {
    return createCorsResponse(null, 204);
}

function invalidateCache() {
    cache.flushAll();
}
