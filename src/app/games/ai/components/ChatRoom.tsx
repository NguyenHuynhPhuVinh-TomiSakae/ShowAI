'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

interface Message {
    id: string;
    room_id: string;
    user_name: string;
    content: string;
    created_at: string;
}

interface ChatRoomProps {
    roomId: string;
    nickname: string;
}

export default function ChatRoom({ roomId, nickname }: ChatRoomProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [supabase, setSupabase] = useState<any>(null);

    useEffect(() => {
        async function initSupabase() {
            try {
                const response = await fetch('/api/supabase-key');
                const { url, key } = await response.json();
                const client = createClient(url, key);
                setSupabase(client);
            } catch (error) {
                console.error('Lỗi khi khởi tạo Supabase:', error);
            }
        }
        initSupabase();
    }, []);

    useEffect(() => {
        if (!supabase) return;

        // Lấy tin nhắn cũ từ Supabase
        const fetchMessages = async () => {
            const { data } = await supabase
                .from('messages')
                .select('*')
                .eq('room_id', roomId)
                .order('created_at', { ascending: true });

            if (data) setMessages(data);
        };

        fetchMessages();

        // Đăng ký lắng nghe tin nhắn mới
        const messagesSubscription = supabase
            .channel(`room-${roomId}-messages`)
            .on('postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `room_id=eq.${roomId}`
                },
                (payload: { new: Message }) => {
                    const newMessage = payload.new;
                    setMessages(prev => [...prev, newMessage]);
                }
            )
            .subscribe();

        return () => {
            messagesSubscription.unsubscribe();
        };
    }, [roomId, supabase]);

    // Cuộn xuống tin nhắn mới nhất
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const message = {
            room_id: roomId,
            user_name: nickname,
            content: newMessage,
            created_at: new Date().toISOString(),
        };

        // Lưu tin nhắn vào Supabase
        const { data, error } = await supabase
            .from('messages')
            .insert([message])
            .select()
            .single();

        if (error) {
            console.error('Lỗi khi gửi tin nhắn:', error);
            return;
        }

        if (data) {
            setNewMessage('');
        }
    };

    if (!supabase) {
        return <div>Đang tải...</div>;
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex ${message.user_name === nickname ? 'justify-end' : 'justify-start'
                            }`}
                    >
                        <div
                            className={`max-w-[70%] rounded-lg p-3 ${message.user_name === nickname
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-700 text-white'
                                }`}
                        >
                            <div className="text-sm font-semibold mb-1">
                                {message.user_name}
                            </div>
                            <div>{message.content}</div>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-700">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-2"
                        placeholder="Nhập tin nhắn..."
                    />
                    <button
                        type="submit"
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                    >
                        Gửi
                    </button>
                </div>
            </form>
        </div>
    );
}
