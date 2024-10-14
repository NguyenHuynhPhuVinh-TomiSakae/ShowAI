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
    const { websiteId, userId } = await request.json();

    try {
        const db = await connectToDatabase();
        const collection = db.collection('data_web_ai');

        const result = await collection.findOneAndUpdate(
            { id: websiteId },
            [
                {
                    $set: {
                        ratings: {
                            $filter: {
                                input: '$ratings',
                                as: 'r',
                                cond: { $ne: ['$$r.userId', userId] }
                            }
                        }
                    }
                },
                {
                    $set: {
                        evaluation: {
                            $cond: {
                                if: { $eq: [{ $size: '$ratings' }, 0] },
                                then: 0,
                                else: { $avg: '$ratings.rating' }
                            }
                        }
                    }
                }
            ],
            { returnDocument: 'after' }
        );

        if (result && result.value) {
            return createCorsResponse({
                success: true,
                newRating: result.value.evaluation || 0
            });
        } else {
            return createCorsResponse({ error: 'Website not found' }, 404);
        }
    } catch (error) {
        console.error('Error removing rating:', error);
        return createCorsResponse({ error: 'Server error' }, 500);
    }
}

export async function OPTIONS() {
    return createCorsResponse(null, 204);
}
