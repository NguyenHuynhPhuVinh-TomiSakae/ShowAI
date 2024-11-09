'use client';

import ChatNav from '@/components/chat/ChatNav';

export default function ChatPage() {
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

            <div className="max-w-2xl mx-auto px-4 pb-8">
                {/* Nội dung trang chat sẽ được thêm vào đây */}
                <div className="text-center text-gray-400 bg-[#1E293B] rounded-lg p-8 border border-[#2A3284]">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <p className="text-lg font-medium">Chưa có tin nhắn nào</p>
                    <p className="text-sm mt-2">Hãy bắt đầu một cuộc trò chuyện mới!</p>
                </div>
            </div>
        </div>
    );
}
