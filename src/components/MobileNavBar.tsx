import { IoClose, IoMenu } from 'react-icons/io5';
import { FaChevronDown, FaChevronUp, FaTools, FaSignOutAlt } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

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

    return (
        <div className="md:hidden">
            <button onClick={toggleSidebar} className="text-white">
                <IoMenu size={32} />
            </button>
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'tween', duration: 0.3 }}
                        className="fixed top-0 right-0 h-full w-64 bg-[#3E52E8] z-50 shadow-lg overflow-y-auto border border-blue-300"
                    >
                        <div className="flex flex-col h-full p-6">
                            <div className="flex justify-between items-center mb-8 border-b border-blue-300 pb-4">
                                <p className="text-2xl font-bold text-white">ShowAI</p>
                                <button
                                    onClick={toggleSidebar}
                                    className="text-white hover:text-gray-200 transition-colors duration-300"
                                    aria-label="Close sidebar"
                                >
                                    <IoClose size={28} />
                                </button>
                            </div>
                            <div className="space-y-6">
                                <div className="bg-[#1E293B] rounded-lg p-2">
                                    <button
                                        onClick={toggleAIToolsDropdown}
                                        className="flex items-center justify-between w-full text-white py-2 px-3 hover:bg-[#4B5563] rounded transition-colors duration-300"
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
                                                    className="block w-full text-left py-2 px-3 text-white hover:bg-[#4B5563] rounded transition-colors duration-300"
                                                >
                                                    AI Giao Diện
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setIsGeminiChatOpen(true);
                                                        toggleSidebar();
                                                    }}
                                                    className="block w-full text-left py-2 px-3 text-white hover:bg-[#4B5563] rounded transition-colors duration-300"
                                                >
                                                    AI Hỗ Trợ
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setIsAICompareModalOpen(true);
                                                        toggleSidebar();
                                                    }}
                                                    className="block w-full text-left py-2 px-3 text-white hover:bg-[#4B5563] rounded transition-colors duration-300"
                                                >
                                                    AI So Sánh
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                                {user ? (
                                    <div className="bg-[#1E293B] rounded-lg p-2">
                                        <button
                                            onClick={toggleUserDropdown}
                                            className="flex items-center justify-between w-full text-white py-2 px-3 hover:bg-[#4B5563] rounded transition-colors duration-300"
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
                                                        onClick={handleLogout}
                                                        className="flex items-center w-full text-left py-2 px-3 text-white hover:bg-[#4B5563] rounded transition-colors duration-300"
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
                                        onClick={() => router.push('/login')}
                                        className="flex items-center w-full text-white py-2 px-3 bg-[#1E293B] hover:bg-[#4B5563] rounded-lg transition-colors duration-300"
                                    >
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