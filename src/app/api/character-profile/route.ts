import { NextResponse } from 'next/server';
import { animeCharacters } from '@/data/animeCharacters';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getDatabase, ServerValue, Database } from 'firebase-admin/database';

// Khởi tạo Firebase Admin
let database: Database | undefined;
try {
    if (!getApps().length) {
        if (!process.env.FIREBASE_DATABASE_URL) {
            throw new Error('FIREBASE_DATABASE_URL is not configured');
        }

        initializeApp({
            credential: cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
            }),
            databaseURL: process.env.FIREBASE_DATABASE_URL
        });
    }
    database = getDatabase();
} catch (error) {
    console.error('Firebase initialization error:', error);
}

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        if (!database) {
            throw new Error('Database connection not initialized');
        }

        // Tạo profile cho mỗi character
        const profiles = animeCharacters.map(character => ({
            id: character.id,
            name: character.name,
            createdAt: ServerValue.TIMESTAMP,
            followCount: 0,
            followers: {}
        }));

        // Lưu profiles vào Firebase
        const profilesRef = database.ref('profiles');

        // Tạo một object với key là character.id
        const profilesData = profiles.reduce((acc, profile) => {
            acc[profile.id] = profile;
            return acc;
        }, {} as Record<string, any>);

        // Cập nhật tất cả profiles cùng một lúc
        await profilesRef.set(profilesData);

        return NextResponse.json({
            success: true,
            data: profiles
        });

    } catch (error: any) {
        console.error('Chi tiết lỗi:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Không thể tạo profiles',
                details: process.env.NODE_ENV === 'development' ? error.toString() : undefined
            },
            { status: 500 }
        );
    }
}
