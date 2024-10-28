'use client';

import { useParams } from 'next/navigation';
import ChatRoom from '../../components/ChatRoom';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RoomPage() {
    const params = useParams();
    const router = useRouter();
    const roomId = params.id as string;
    const [nickname, setNickname] = useState('');

    useEffect(() => {
        // Lấy nickname từ localStorage
        const storedNickname = localStorage.getItem('nickname');

        // Nếu không có nickname, chuyển về trang nhập nickname
        if (!storedNickname) {
            router.push('/games/ai');
            return;
        }

        setNickname(storedNickname);
    }, [router]);

    // Không hiển thị gì nếu chưa có nickname
    if (!nickname) {
        return null;
    }

    return (
        <div className="min-h-screen bg-[#0F172A] text-white">
            <div className="container mx-auto p-4">
                <ChatRoom roomId={roomId} nickname={nickname} />
            </div>
        </div>
    );
}
