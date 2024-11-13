'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ref, onValue, get, getDatabase, query, limitToLast, orderByChild } from 'firebase/database';
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
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const messagesPerPage = 20;

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

        // Sửa đổi phần lắng nghe tin nhắn
        const messagesRef = ref(database, `groups/${groupIdString}/messages`);
        const messagesQuery = query(
            messagesRef,
            orderByChild('timestamp'),
            limitToLast(messagesPerPage)
        );

        const unsubscribe = onValue(messagesQuery, (snapshot) => {
            if (snapshot.exists()) {
                const messagesData = snapshot.val();
                const messagesList = Object.entries(messagesData)
                    .map(([id, data]: [string, any]) => ({
                        id,
                        ...data
                    }))
                    .sort((a, b) => b.timestamp - a.timestamp);

                const uniqueMessages = messagesList.filter((message, index, self) =>
                    index === self.findIndex((m) => m.id === message.id)
                );

                setMessages(uniqueMessages);
            }
        });

        return () => unsubscribe();
    }, [auth, groupId]);

    const loadMoreMessages = async () => {
        if (isLoadingMore || !messages.length) return;

        setIsLoadingMore(true);
        const database = getDatabase();
        const groupIdString = groupId?.toString() || '';
        const oldestMessageTimestamp = messages[messages.length - 1]?.timestamp;

        const messagesRef = ref(database, `groups/${groupIdString}/messages`);

        try {
            // Lấy tất cả tin nhắn và xử lý ở client
            const snapshot = await get(messagesRef);
            if (snapshot.exists()) {
                const allMessages = Object.entries(snapshot.val())
                    .map(([id, data]: [string, any]) => ({
                        id,
                        ...data
                    }))
                    // Lọc lấy tin nhắn cũ hơn tin nhắn cuối cùng hiện tại
                    .filter(msg => msg.timestamp < oldestMessageTimestamp)
                    .sort((a, b) => b.timestamp - a.timestamp);

                // Lấy messagesPerPage tin nhắn tiếp theo
                const moreMessages = allMessages.slice(0, messagesPerPage);

                if (moreMessages.length === 0) {
                    setHasMore(false);
                } else {
                    setMessages(prev => {
                        const combinedMessages = [...prev, ...moreMessages];
                        return combinedMessages
                            .filter((message, index, self) =>
                                index === self.findIndex((m) => m.id === message.id)
                            )
                            .sort((a, b) => b.timestamp - a.timestamp);
                    });
                    // Còn tin nhắn để load nếu còn tin nhắn trong allMessages
                    setHasMore(allMessages.length > messagesPerPage);
                }
            } else {
                setHasMore(false);
            }
        } catch (error) {
            console.error('Error loading more messages:', error);
        } finally {
            setIsLoadingMore(false);
        }
    };

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

                    {hasMore && (
                        <div className="mt-4">
                            <button
                                onClick={loadMoreMessages}
                                disabled={isLoadingMore}
                                className="w-full py-2 bg-[#2A3284] text-white rounded-lg hover:bg-[#1E2563] disabled:opacity-50"
                            >
                                {isLoadingMore ? 'Đang tải...' : 'Xem thêm tin nhắn cũ'}
                            </button>
                        </div>
                    )}

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
