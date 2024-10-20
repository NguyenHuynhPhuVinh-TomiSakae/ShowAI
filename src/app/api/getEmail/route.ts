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

export async function GET() {
    try {
        const db = await connectToDatabase();
        const collection = db.collection('emails');

        const emails = await collection.find({}).project({ email: 1, _id: 0 }).toArray();
        const emailList = emails.map(doc => doc.email);

        return NextResponse.json(emailList);
    } catch (error) {
        console.error('Lỗi khi lấy danh sách email:', error);
        return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
    }
}