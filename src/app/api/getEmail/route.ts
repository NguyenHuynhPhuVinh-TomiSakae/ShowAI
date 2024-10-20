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

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
        return NextResponse.json({ error: 'UserId không được cung cấp' }, { status: 400 });
    }

    try {
        const db = await connectToDatabase();
        const collection = db.collection('emails');

        const userEmail = await collection.findOne({ userId });

        if (userEmail) {
            return NextResponse.json({ isSubscribed: true, email: userEmail.email });
        } else {
            return NextResponse.json({ isSubscribed: false });
        }
    } catch (error) {
        console.error('Lỗi khi kiểm tra đăng ký email:', error);
        return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
    }
}
