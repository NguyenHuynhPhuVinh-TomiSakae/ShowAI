import { NextResponse } from 'next/server';
import { MongoClient, Db } from 'mongodb';

const uri = process.env.MONGODB_URI;
if (!uri) {
    throw new Error('MONGODB_URI is not defined in the environment variables');
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
    const { id, increment } = await request.json();

    try {
        const db = await connectToDatabase();
        const collection = db.collection('data_web_ai');

        const result = await collection.findOneAndUpdate(
            { id: id },
            { $inc: { heart: increment ? 1 : -1 } }, // Change heartCount to heart
            { returnDocument: 'after' }
        );

        if (result && result.value) {
            return createCorsResponse({ success: true, newHeartCount: result.value.heart });
        } else {
            return createCorsResponse({ error: 'Website not found' }, 404);
        }
    } catch (error) {
        console.error('Error updating heart count:', error);
        return createCorsResponse({ error: 'Server error' }, 500);
    }
}
