'use client';

import ChatNav from '@/components/chat/ChatNav';

export default function GroupsPage() {
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

            <div className="max-w-2xl mx-auto px-4 pb-8">
                <div className="text-center text-gray-400 bg-[#1E293B] rounded-lg p-8 border border-[#2A3284]">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <p className="text-lg font-medium">Chưa có nhóm nào</p>
                    <p className="text-sm mt-2">Tạo hoặc tham gia một nhóm để bắt đầu trò chuyện!</p>
                </div>
            </div>
        </div>
    );
}
