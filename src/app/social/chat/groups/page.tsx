'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getDatabase, ref, get } from 'firebase/database';
import { useFirebase } from '@/components/FirebaseConfig';
import ChatNav from '@/components/chat/ChatNav';
import { IoChevronForward } from "react-icons/io5";

interface GroupChat {
    id: string;
    name: string;
    lastMessage: string;
    memberCount: number;
    members: {
        [key: string]: {
            id: number;
            name: string;
            personality: string;
            joinedAt: number;
        }
    };
}

interface GroupData {
    id: string;
    name: string;
    createdAt: number;
    memberCount: number;
    members: {
        [key: string]: {
            id: number;
            name: string;
            personality: string;
            joinedAt: number;
        }
    };
    messages?: {
        [key: string]: {
            userId: string;
            content: string;
            timestamp: number;
        }
    };
}

export default function GroupsPage() {
    const { auth } = useFirebase();
    const [groups, setGroups] = useState<GroupChat[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchGroups = async () => {
            if (!auth?.currentUser) return;

            try {
                const db = getDatabase();
                const groupsRef = ref(db, 'groups');
                const snapshot = await get(groupsRef);

                if (snapshot.exists()) {
                    const groupsData = snapshot.val() as { [key: string]: GroupData };
                    const userGroups: GroupChat[] = [];

                    for (const [groupId, groupData] of Object.entries(groupsData)) {
                        userGroups.push({
                            id: groupId,
                            name: groupData.name,
                            lastMessage: groupData.messages
                                ? Object.values(groupData.messages).sort((a, b) => b.timestamp - a.timestamp)[0]?.content || ''
                                : 'Chưa có tin nhắn',
                            memberCount: groupData.memberCount,
                            members: groupData.members
                        });
                    }
                    setGroups(userGroups);
                }
            } catch (error) {
                console.error('Lỗi khi tải danh sách nhóm:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchGroups();
    }, [auth]);

    const handleClick = (groupId: string) => {
        router.push(`/social/chat/groups/${groupId}`);
    };

    return (
        <div className="min-h-screen bg-[#0F172A]">
            <div className="bg-[#2A3284] text-center py-8 px-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                    Nhóm trò chuyện
                </h1>
                <p className="text-base sm:text-lg text-gray-200">
                    Quản lý các nhóm trò chuyện của bạn
                </p>
            </div>

            <ChatNav />

            <div className="max-w-2xl mx-auto px-4 pb-8 pt-4">
                {loading ? (
                    // ... loading skeleton giống như trang chat ...
                    <div className="animate-pulse bg-[#1E293B] p-4 rounded-lg border border-[#2A3284]">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 rounded-full bg-[#2A3284]"></div>
                            <div className="flex-1">
                                <div className="h-4 bg-[#2A3284] rounded w-1/4 mb-2"></div>
                                <div className="h-3 bg-[#2A3284] rounded w-1/6"></div>
                            </div>
                        </div>
                    </div>
                ) : groups.length === 0 ? (
                    <div className="text-center text-gray-400 bg-[#1E293B] rounded-lg p-8 border border-[#2A3284]">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <p className="text-lg font-medium">Chưa có nhóm nào</p>
                        <p className="text-sm mt-2">Tạo hoặc tham gia một nhóm để bắt đầu trò chuyện!</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {groups.map((group) => (
                            <div
                                key={group.id}
                                onClick={() => handleClick(group.id)}
                                className="bg-[#1E293B] p-4 rounded-lg border border-[#2A3284] hover:border-blue-500 transition-colors cursor-pointer"
                            >
                                <div className="flex items-center justify-between space-x-4">
                                    <div className="flex items-center space-x-4 min-w-0 flex-1">
                                        <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-full bg-[#2A3284] text-white text-xl font-bold">
                                            {group.name.charAt(0)}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center">
                                                <h3 className="font-semibold text-white truncate">
                                                    {group.name}
                                                </h3>
                                                <span className="ml-2 text-sm text-gray-400">
                                                    ({group.memberCount} thành viên)
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-400 truncate">
                                                {group.lastMessage}
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
