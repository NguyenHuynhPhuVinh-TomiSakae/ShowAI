import { NextResponse } from 'next/server';
import { programmingCharacters2 } from '@/data/programmingCharacters2';
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

        const profilesRef = database.ref('profiles');

        // Đọc profiles hiện có
        const snapshot = await profilesRef.once('value');
        const existingProfiles = snapshot.val() || {};

        // Tạo profile cho các character chưa tồn tại
        const profiles = programmingCharacters2.map(character => {
            // Nếu profile đã tồn tại, giữ nguyên data cũ
            if (existingProfiles[character.id]) {
                return existingProfiles[character.id];
            }
            // Nếu chưa tồn tại, tạo mới
            return {
                id: character.id,
                name: character.name,
                createdAt: ServerValue.TIMESTAMP,
                followCount: 0,
                followers: {}
            };
        });

        // Chuyển đổi thành object và update
        const profilesData = profiles.reduce((acc, profile) => {
            acc[profile.id] = profile;
            return acc;
        }, {} as Record<string, any>);

        // Update thay vì set để không ghi đè data
        await profilesRef.update(profilesData);

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
