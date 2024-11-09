'use client';

import { useRouter, usePathname } from 'next/navigation';

export default function SocialNav() {
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
                        onClick={() => handleNavigation('/social')}
                        className={`flex items-center px-4 py-3 text-white whitespace-nowrap ${isActive('/social')}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                        </svg>
                        Trang chủ
                    </button>

                    <button
                        onClick={() => handleNavigation('/social/trending')}
                        className={`flex items-center px-4 py-3 text-white whitespace-nowrap ${isActive('/social/trending')}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                        </svg>
                        Xu hướng
                    </button>

                    <button
                        onClick={() => handleNavigation('/social/search')}
                        className={`flex items-center px-4 py-3 text-white whitespace-nowrap ${isActive('/social/search')}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                        </svg>
                        Tìm kiếm
                    </button>

                    <button
                        onClick={() => handleNavigation('/social/following')}
                        className={`flex items-center px-4 py-3 text-white whitespace-nowrap ${isActive('/social/following')}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                        </svg>
                        Theo dõi
                    </button>

                    <button
                        onClick={() => handleNavigation('/social/account')}
                        className={`flex items-center px-4 py-3 text-white whitespace-nowrap ${isActive('/social/account')}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                        Tài khoản
                    </button>
                </div>
            </div>
        </nav>
    );
}
