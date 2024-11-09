'use client';

import { useRouter, usePathname } from 'next/navigation';

export default function ChatNav() {
    const router = useRouter();
    const pathname = usePathname();

    const isActive = (path: string) => {
        return pathname === path ? 'bg-[#2A3284]' : 'hover:bg-[#1E293B]';
    };

    const handleNavigation = (path: string) => {
        router.push(path);
    };

    return (
        <nav className="bg-[#0F172A] border-b border-[#2A3284] mb-8">
            <div className="max-w-2xl mx-auto px-4">
                <div className="flex overflow-x-auto no-scrollbar">
                    <button
                        onClick={() => handleNavigation('/social/chat')}
                        className={`flex items-center px-4 py-3 text-white whitespace-nowrap ${isActive('/social/chat')}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                            <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                        </svg>
                        Tin nhắn
                    </button>

                    <button
                        onClick={() => handleNavigation('/social/chat/groups')}
                        className={`flex items-center px-4 py-3 text-white whitespace-nowrap ${isActive('/social/chat/groups')}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                        </svg>
                        Nhóm chat
                    </button>

                    <button
                        onClick={() => handleNavigation('/social/chat/contacts')}
                        className={`flex items-center px-4 py-3 text-white whitespace-nowrap ${isActive('/social/chat/contacts')}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                        Danh bạ
                    </button>

                    <button
                        onClick={() => handleNavigation('/social/chat/requests')}
                        className={`flex items-center px-4 py-3 text-white whitespace-nowrap ${isActive('/social/chat/requests')}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                        </svg>
                        Lời mời
                    </button>

                    <button
                        onClick={() => handleNavigation('/social/chat/search')}
                        className={`flex items-center px-4 py-3 text-white whitespace-nowrap ${isActive('/social/chat/search')}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                        </svg>
                        Tìm kiếm
                    </button>
                </div>
            </div>
        </nav>
    );
}
