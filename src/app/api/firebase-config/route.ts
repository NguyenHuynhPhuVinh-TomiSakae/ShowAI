import { NextResponse } from 'next/server';

export async function GET() {
    const firebaseConfig = {
        apiKey: process.env.FIREBASE_API_KEY,
        authDomain: process.env.FIREBASE_AUTH_DOMAIN,
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.FIREBASE_APP_ID,
        databaseURL: process.env.FIREBASE_DATABASE_URL,
        measurementId: process.env.FIREBASE_MEASUREMENT_ID
    };

    return NextResponse.json(firebaseConfig, {
        headers: {
            'Cache-Control': 'no-store, max-age=0',
            'Content-Type': 'application/json',
        },
    });
}