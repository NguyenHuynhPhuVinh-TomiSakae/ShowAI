'use client';

import ChatNav from '@/components/chat/ChatNav';

export default function RequestsPage() {
    return (
        <div className="min-h-screen bg-[#0F172A]">
            <div className="bg-[#2A3284] text-center py-8 px-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                    Lời mời kết nối
                </h1>
                <p className="text-base sm:text-lg text-gray-200">
                    Quản lý các lời mời kết nối của bạn
                </p>
            </div>

            <ChatNav />

            <div className="max-w-2xl mx-auto px-4 pb-8">
                <div className="text-center text-gray-400 bg-[#1E293B] rounded-lg p-8 border border-[#2A3284]">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <p className="text-lg font-medium">Chưa có lời mời nào</p>
                    <p className="text-sm mt-2">Bạn sẽ thấy các lời mời kết nối ở đây</p>
                </div>
            </div>
        </div>
    );
}
