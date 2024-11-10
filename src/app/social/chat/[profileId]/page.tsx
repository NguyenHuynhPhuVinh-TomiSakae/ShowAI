'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ref, onValue, push, get, getDatabase } from 'firebase/database';
import { useFirebase } from '@/components/FirebaseConfig';
import ChatNav from '@/components/chat/ChatNav';

interface Message {
    id: string;
    userId: string;
    content: string;
    timestamp: number;
    isReply?: boolean;
}

interface Profile {
    name: string;
}

export default function ChatPage() {
    const { profileId } = useParams();
    const { auth } = useFirebase();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [profile, setProfile] = useState<Profile | null>(null);

    useEffect(() => {
        if (!auth?.currentUser || profileId === undefined) return;

        const database = getDatabase();

        const profileIdString = profileId.toString();

        const profileRef = ref(database, `profiles/${profileIdString}`);
        get(profileRef).then((snapshot) => {
            if (snapshot.exists()) {
                const profileData = snapshot.val();
                setProfile(profileData);
            }
        });

        const messagesRef = ref(database, `profiles/${profileIdString}/messages`);
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
    }, [auth, profileId]);

    const sendMessage = async () => {
        if (!newMessage.trim() || !auth?.currentUser || profileId === undefined) return;

        const database = getDatabase();
        const messagesRef = ref(database, `profiles/${profileId.toString()}/messages`);

        await push(messagesRef, {
            userId: auth.currentUser.uid,
            content: newMessage,
            timestamp: Date.now(),
            isReply: false
        });

        setNewMessage('');
    };

    return (
        <div className="min-h-screen bg-[#0F172A]">
            <div className="bg-[#2A3284] text-center py-8 px-4">
                <h1 className="text-2xl font-bold text-white">
                    {profile?.name || 'Đang tải...'}
                </h1>
            </div>

            <ChatNav />

            <div className="max-w-2xl mx-auto px-4 py-8">
                <div className="bg-[#1E293B] rounded-lg p-4 h-[60vh] flex flex-col">
                    <div className="flex-1 overflow-y-auto space-y-4">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex ${message.isReply ? 'justify-start' : 'justify-end'}`}
                            >
                                <div className={`max-w-[70%] rounded-lg p-3 ${message.isReply
                                    ? 'bg-[#2A3284] text-white'
                                    : 'bg-green-600 text-white'
                                    }`}>
                                    {message.content}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 flex gap-2">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                            placeholder="Nhập câu hỏi của bạn..."
                            className="flex-1 bg-[#0F172A] text-white rounded-lg px-4 py-2"
                        />
                        <button
                            onClick={sendMessage}
                            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
                        >
                            Gửi
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
