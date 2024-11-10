'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getDatabase, ref, get } from 'firebase/database';
import { useFirebase } from '@/components/FirebaseConfig';
import ChatNav from '@/components/chat/ChatNav';
import { IoChevronForward } from "react-icons/io5";

interface ChatProfile {
    id: string;
    name: string;
    lastMessage: string;
}

interface ProfileData {
    name: string;
    messages?: {
        [key: string]: {
            userId: string;
            content: string;
            timestamp: number;
        }
    };
}

export default function ChatPage() {
    const { auth } = useFirebase();
    const [chatProfiles, setChatProfiles] = useState<ChatProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchChatProfiles = async () => {
            if (!auth?.currentUser) return;

            try {
                const db = getDatabase();
                const profilesRef = ref(db, 'profiles');
                const snapshot = await get(profilesRef);

                if (snapshot.exists()) {
                    const profiles = snapshot.val() as { [key: string]: ProfileData };
                    const userChats: ChatProfile[] = [];

                    for (const [profileId, profileData] of Object.entries(profiles)) {
                        if (profileData.messages) {
                            const hasUserMessages = Object.values(profileData.messages).some(
                                (msg) => msg.userId === auth.currentUser?.uid
                            );

                            if (hasUserMessages) {
                                const messages = Object.values(profileData.messages);
                                const lastMessage = messages.sort((a, b) => b.timestamp - a.timestamp)[0];

                                userChats.push({
                                    id: profileId,
                                    name: profileData.name,
                                    lastMessage: lastMessage.content
                                });
                            }
                        }
                    }
                    setChatProfiles(userChats);
                }
            } catch (error) {
                console.error('Lỗi khi tải danh sách chat:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchChatProfiles();
    }, [auth]);

    const handleClick = (profileId: string) => {
        router.push(`/social/chat/${profileId}`);
    };

    return (
        <div className="min-h-screen bg-[#0F172A]">
            <div className="bg-[#2A3284] text-center py-8 px-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                    Trò chuyện
                </h1>
                <p className="text-base sm:text-lg text-gray-200">
                    Kết nối và trò chuyện với AI
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
                ) : chatProfiles.length === 0 ? (
                    <div className="text-center text-gray-400 bg-[#1E293B] rounded-lg p-8">
                        <p className="text-lg">Chưa có cuộc trò chuyện nào</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {chatProfiles.map((profile) => (
                            <div
                                key={profile.id}
                                onClick={() => handleClick(profile.id)}
                                className="bg-[#1E293B] p-4 rounded-lg border border-[#2A3284] hover:border-blue-500 transition-colors cursor-pointer"
                            >
                                <div className="flex items-center justify-between space-x-4">
                                    <div className="flex items-center space-x-4 min-w-0 flex-1">
                                        <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-full bg-[#2A3284] text-white text-xl font-bold">
                                            {profile.name.charAt(0)}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h3 className="font-semibold text-white truncate">
                                                {profile.name}
                                            </h3>
                                            <p className="text-sm text-gray-400 truncate">
                                                {profile.lastMessage}
                                            </p>
                                        </div>
                                    </div>
                                    <IoChevronForward className="text-gray-400 text-xl flex-shrink-0" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
