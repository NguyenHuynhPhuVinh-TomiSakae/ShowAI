'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ref, onValue, get, getDatabase } from 'firebase/database';
import { useFirebase } from '@/components/FirebaseConfig';
import ChatNav from '@/components/chat/ChatNav';

interface Message {
    id: string;
    userId: string;
    content: string;
    timestamp: number;
}

interface GroupData {
    name: string;
    members: {
        [key: string]: {
            id: number;
            name: string;
            personality: string;
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

export default function GroupChatPage() {
    const { groupId } = useParams();
    const { auth } = useFirebase();
    const [messages, setMessages] = useState<Message[]>([]);
    const [groupData, setGroupData] = useState<GroupData | null>(null);

    useEffect(() => {
        if (!auth?.currentUser || groupId === undefined) return;

        const database = getDatabase();
        const groupIdString = groupId.toString();

        // Lấy thông tin nhóm
        const groupRef = ref(database, `groups/${groupIdString}`);
        get(groupRef).then((snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                setGroupData(data);
            }
        });

        // Lắng nghe tin nhắn realtime
        const messagesRef = ref(database, `groups/${groupIdString}/messages`);
        const unsubscribe = onValue(messagesRef, (snapshot) => {
            if (snapshot.exists()) {
                const messagesData = snapshot.val();
                const messagesList = Object.entries(messagesData).map(([id, data]: [string, any]) => ({
                    id,
                    ...data
                }));
                setMessages(messagesList.sort((a, b) => a.timestamp - b.timestamp));
            }
        });

        return () => unsubscribe();
    }, [auth, groupId]);

    return (
        <div className="flex flex-col min-h-screen bg-[#0F172A]">
            <div className="bg-[#2A3284] text-center py-8 px-4">
                <h1 className="text-2xl font-bold text-white">
                    {groupData?.name || 'Đang tải...'}
                </h1>
                {groupData && (
                    <p className="text-gray-200 mt-2">
                        {Object.values(groupData.members).map(m => m.name).join(', ')}
                    </p>
                )}
            </div>

            <ChatNav />

            <div className="flex-1 px-4 py-8">
                <div className="max-w-2xl mx-auto bg-[#1E293B] rounded-lg p-4 h-auto">
                    <div className="space-y-4">
                        {messages.map((message) => {
                            const member = groupData?.members[message.userId];
                            return (
                                <div key={message.id} className="flex flex-col">
                                    <span className="text-sm text-gray-400 mb-1">
                                        {member?.name || 'Unknown'}
                                    </span>
                                    <div className="bg-[#2A3284] text-white rounded-lg p-3 max-w-[70%]">
                                        {message.content}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-4 p-4 bg-[#0F172A] rounded-lg">
                        <p className="text-gray-400 text-center">
                            Đây là cuộc trò chuyện chỉ để xem
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
