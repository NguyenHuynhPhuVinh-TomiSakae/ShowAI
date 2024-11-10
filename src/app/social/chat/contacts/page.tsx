'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { initializeFirebase } from '@/lib/firebase';
import { ref, get } from 'firebase/database';
import ChatNav from '@/components/chat/ChatNav';
import { useFirebase } from '@/components/FirebaseConfig';

interface Profile {
    id: string;
    name: string;
    followCount: number;
    friends?: { [key: string]: boolean };
}

export default function ContactsPage() {
    const { auth } = useFirebase();
    const [friends, setFriends] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const fetchFriends = async () => {
        if (!auth?.currentUser) return;

        try {
            const database = await initializeFirebase();
            const profilesRef = ref(database, 'profiles');
            const snapshot = await get(profilesRef);

            if (snapshot.exists()) {
                const profilesData = snapshot.val();
                const currentUserId = auth.currentUser.uid;

                // Lọc ra những profile có currentUserId trong danh sách friends
                const friendsList = Object.entries(profilesData)
                    .map(([id, data]: [string, any]) => ({
                        id,
                        name: data.name,
                        followCount: data.followCount || 0,
                        friends: data.friends || {}
                    }))
                    .filter(profile => profile.friends?.[currentUserId] === true);

                setFriends(friendsList);
            }
        } catch (error) {
            console.error('Lỗi khi tải danh sách bạn bè:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFriends();
    }, [auth]);

    const handleProfileClick = (profileId: string) => {
        router.push(`/character/${profileId}`);
    };

    const handleChatClick = (profileId: string, event: React.MouseEvent) => {
        event.stopPropagation();
        router.push(`/social/chat/${profileId}`);
    };

    return (
        <div className="min-h-screen bg-[#0F172A]">
            <div className="bg-[#2A3284] text-center py-8 px-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                    Danh bạ
                </h1>
                <p className="text-base sm:text-lg text-gray-200">
                    Những AI bạn đã kết nối
                </p>
            </div>

            <ChatNav />

            <div className="max-w-2xl mx-auto px-4 pb-8 pt-4">
                {loading ? (
                    <div className="space-y-4">
                        <div className="animate-pulse bg-[#1E293B] p-4 rounded-lg border border-[#2A3284]">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 rounded-full bg-[#2A3284]"></div>
                                <div className="flex-1">
                                    <div className="h-4 bg-[#2A3284] rounded w-1/4 mb-2"></div>
                                    <div className="h-3 bg-[#2A3284] rounded w-1/6"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : friends.length === 0 ? (
                    <div className="text-center text-gray-400 bg-[#1E293B] rounded-lg p-8">
                        <p className="text-lg">Bạn chưa kết nối với AI nào</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {friends.map((profile) => (
                            <div
                                key={profile.id}
                                onClick={() => handleProfileClick(profile.id)}
                                className="bg-[#1E293B] p-4 rounded-lg border border-[#2A3284] hover:border-blue-500 transition-colors cursor-pointer"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 flex items-center justify-center rounded-full bg-[#2A3284] text-white text-xl font-bold">
                                            {profile.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-white">{profile.name}</h3>
                                            <p className="text-sm text-gray-400">
                                                {profile.followCount} người theo dõi
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => handleChatClick(profile.id, e)}
                                        className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors"
                                    >
                                        Nhắn tin
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
