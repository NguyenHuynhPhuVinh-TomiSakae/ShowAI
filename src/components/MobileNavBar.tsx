import { IoClose } from 'react-icons/io5';
import { FaBars } from 'react-icons/fa';
import { FaChevronDown, FaChevronUp, FaTools, FaSignOutAlt, FaUserCircle, FaUser, FaTrophy } from 'react-icons/fa';
import { IoMdChatbubbles } from 'react-icons/io';
import { MdCompareArrows, MdDesignServices } from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

interface MobileNavBarProps {
    isSidebarOpen: boolean;
    toggleSidebar: () => void;
    isAIToolsDropdownOpen: boolean;
    toggleAIToolsDropdown: () => void;
    setIsAIDesignModalOpen: (isOpen: boolean) => void;
    setIsGeminiChatOpen: (isOpen: boolean) => void;
    setIsAICompareModalOpen: (isOpen: boolean) => void;
    user: { username: string } | null;
    isUserDropdownOpen: boolean;
    toggleUserDropdown: () => void;
    handleLogout: () => void;
}

const MobileNavBar: React.FC<MobileNavBarProps> = ({
    isSidebarOpen,
    toggleSidebar,
    isAIToolsDropdownOpen,
    toggleAIToolsDropdown,
    setIsAIDesignModalOpen,
    setIsGeminiChatOpen,
    setIsAICompareModalOpen,
    user,
    isUserDropdownOpen,
    toggleUserDropdown,
    handleLogout
}) => {
    const router = useRouter();
    const sidebarRef = useRef<HTMLDivElement>(null);

    const handleLoginClick = () => {
        router.push('/login');
        toggleSidebar(); // Tắt thanh bên khi nhấn đăng nhập
    };

    const handleLogoutClick = () => {
        handleLogout();
        toggleSidebar(); // Tắt thanh bên khi đăng xuất
    };

    const handleAccountClick = () => {
        router.push('/account');
        toggleSidebar();
    };

    const handleLeaderboardClick = () => {
        router.push('/leaderboard');
        toggleSidebar();
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node) && isSidebarOpen) {
                toggleSidebar();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isSidebarOpen, toggleSidebar]);

    return (
        <div className="md:hidden">
            <button
                onClick={toggleSidebar}
                className="fixed top-4 right-4 z-50 bg-gray-800 text-white p-2 rounded-full shadow-lg hover:bg-gray-700 transition-colors duration-300"
                aria-label="Toggle sidebar"
            >
                {isSidebarOpen ? <IoClose size={24} /> : <FaBars size={24} />}
            </button>
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        ref={sidebarRef}
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'tween', duration: 0.3 }}
                        className="fixed top-0 right-0 h-full w-64 bg-gray-900 z-40 overflow-y-auto border-l border-gray-700 shadow-[0_0_15px_rgba(0,0,0,0.5)]"
                    >
                        <div className="flex flex-col h-full">
                            <div className="flex items-center px-6 py-3 mt-3 border-b border-gray-700">
                                <p className="text-2xl font-bold text-white">ShowAI</p>
                            </div>
                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                <div className="bg-gray-800 rounded-lg p-2 border border-blue-400">
                                    <button
                                        onClick={toggleAIToolsDropdown}
                                        className="flex items-center justify-between w-full text-blue-400 py-2 px-3 hover:bg-blue-400 hover:text-gray-800 rounded transition-colors duration-300"
                                    >
                                        <span className="flex items-center">
                                            <FaTools className="mr-3" />
                                            Công Cụ AI
                                        </span>
                                        {isAIToolsDropdownOpen ? <FaChevronUp /> : <FaChevronDown />}
                                    </button>
                                    <AnimatePresence>
                                        {isAIToolsDropdownOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                transition={{ duration: 0.3 }}
                                                className="mt-2 space-y-2 pl-6"
                                            >
                                                <button
                                                    onClick={() => {
                                                        setIsAIDesignModalOpen(true);
                                                        toggleSidebar();
                                                    }}
                                                    className="dropdown-item text-blue-400 hover:bg-blue-400 hover:text-gray-800"
                                                >
                                                    <MdDesignServices className="mr-3" />
                                                    AI Giao Diện
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setIsGeminiChatOpen(true);
                                                        toggleSidebar();
                                                    }}
                                                    className="dropdown-item text-blue-400 hover:bg-blue-400 hover:text-gray-800"
                                                >
                                                    <IoMdChatbubbles className="mr-3" />
                                                    AI Hỗ Trợ
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setIsAICompareModalOpen(true);
                                                        toggleSidebar();
                                                    }}
                                                    className="dropdown-item text-blue-400 hover:bg-blue-400 hover:text-gray-800"
                                                >
                                                    <MdCompareArrows className="mr-3" />
                                                    AI So Sánh
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                                <button
                                    onClick={handleLeaderboardClick}
                                    className="nav-button w-full justify-center bg-gray-800 border border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-gray-800"
                                >
                                    <FaTrophy className="mr-4 text-xl" />
                                    Bảng Xếp Hạng
                                </button>
                                {user ? (
                                    <div className="bg-gray-800 rounded-lg p-2 border border-teal-400">
                                        <button
                                            onClick={toggleUserDropdown}
                                            className="flex items-center justify-between w-full text-teal-400 py-2 px-3 hover:bg-teal-400 hover:text-gray-800 rounded transition-colors duration-300"
                                        >
                                            <span>{user.username}</span>
                                            {isUserDropdownOpen ? <FaChevronUp /> : <FaChevronDown />}
                                        </button>
                                        <AnimatePresence>
                                            {isUserDropdownOpen && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    transition={{ duration: 0.3 }}
                                                    className="mt-2"
                                                >
                                                    <button
                                                        onClick={handleAccountClick}
                                                        className="dropdown-item text-teal-400 hover:bg-teal-400 hover:text-gray-800"
                                                    >
                                                        <FaUser className="mr-3" />
                                                        Tài Khoản
                                                    </button>
                                                    <button
                                                        onClick={handleLogoutClick}
                                                        className="dropdown-item text-teal-400 hover:bg-teal-400 hover:text-gray-800"
                                                    >
                                                        <FaSignOutAlt className="mr-3" />
                                                        Đăng Xuất
                                                    </button>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ) : (
                                    <button
                                        onClick={handleLoginClick}
                                        className="nav-button w-full justify-center bg-gray-800 border border-teal-400 text-teal-400 hover:bg-teal-400 hover:text-gray-800"
                                    >
                                        <FaUserCircle className="mr-4 text-xl" />
                                        Đăng Nhập
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MobileNavBar;
