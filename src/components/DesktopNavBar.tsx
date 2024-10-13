import React, { useRef } from 'react';
import { FaChevronDown, FaChevronUp, FaCircle, FaTools, FaSignOutAlt, FaUserCircle, FaUser, FaTrophy } from 'react-icons/fa';
import { IoMdChatbubbles } from 'react-icons/io';
import { MdCompareArrows } from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface DesktopNavBarProps {
    isAIToolsDropdownOpen: boolean;
    setIsAIToolsDropdownOpen: (isOpen: boolean) => void;
    setIsAIDesignModalOpen: (isOpen: boolean) => void;
    setIsGeminiChatOpen: (isOpen: boolean) => void;
    setIsAICompareModalOpen: (isOpen: boolean) => void;
    isLive2DModalOpen: boolean;
    toggleLive2DModal: () => void;
    user: { username: string } | null;
    isUserDropdownOpen: boolean;
    setIsUserDropdownOpen: (isOpen: boolean) => void;
    handleLogout: () => void;
}

const DesktopNavBar: React.FC<DesktopNavBarProps> = ({
    isAIToolsDropdownOpen,
    setIsAIToolsDropdownOpen,
    setIsAIDesignModalOpen,
    setIsGeminiChatOpen,
    setIsAICompareModalOpen,
    isLive2DModalOpen,
    toggleLive2DModal,
    user,
    isUserDropdownOpen,
    setIsUserDropdownOpen,
    handleLogout
}) => {
    const router = useRouter();
    const aiToolsRef = useRef<HTMLDivElement>(null);
    const userDropdownRef = useRef<HTMLDivElement>(null);

    const handleMouseEnter = (setDropdown: (isOpen: boolean) => void) => {
        setDropdown(true);
    };

    const handleMouseLeave = (setDropdown: (isOpen: boolean) => void) => {
        setDropdown(false);
    };

    const handleLive2DToggle = () => {
        toggleLive2DModal();
        if (isLive2DModalOpen) {
            window.dispatchEvent(new Event('live2dModelClosed'));
        }
    };

    return (
        <div className="hidden md:flex md:items-center">
            <div className="md:relative md:w-auto md:bg-transparent md:flex md:items-center">
                <div className="flex flex-row p-0">
                    <div
                        className="relative group"
                        ref={aiToolsRef}
                        onMouseEnter={() => handleMouseEnter(setIsAIToolsDropdownOpen)}
                        onMouseLeave={() => handleMouseLeave(setIsAIToolsDropdownOpen)}
                    >
                        <button
                            className="text-white px-4 py-2 rounded mx-2 bg-[#1E293B] hover:bg-[#2D3748] transition-colors duration-300 w-auto mb-0 flex items-center justify-between"
                        >
                            <FaTools className="mr-2" />
                            Công Cụ AI
                            {isAIToolsDropdownOpen ? <FaChevronUp className="ml-2" /> : <FaChevronDown className="ml-2" />}
                        </button>
                        <AnimatePresence>
                            {isAIToolsDropdownOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute top-full right-0 w-64 bg-[#1E293B] rounded-md shadow-lg z-10"
                                >
                                    <div className="p-4 space-y-2">
                                        <button
                                            onClick={() => {
                                                setIsAIDesignModalOpen(true);
                                                setIsAIToolsDropdownOpen(false);
                                            }}
                                            className="flex items-center w-full text-left py-2 px-3 text-white hover:bg-[#4B5563] rounded transition-colors duration-300"
                                        >
                                            <FaTools className="mr-3" />
                                            AI Giao Diện
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsGeminiChatOpen(true);
                                                setIsAIToolsDropdownOpen(false);
                                            }}
                                            className="flex items-center w-full text-left py-2 px-3 text-white hover:bg-[#4B5563] rounded transition-colors duration-300"
                                        >
                                            <IoMdChatbubbles className="mr-3" />
                                            AI Hỗ Trợ
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsAICompareModalOpen(true);
                                                setIsAIToolsDropdownOpen(false);
                                            }}
                                            className="flex items-center w-full text-left py-2 px-3 text-white hover:bg-[#4B5563] rounded transition-colors duration-300"
                                        >
                                            <MdCompareArrows className="mr-3" />
                                            AI So Sánh
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    <motion.button
                        onClick={handleLive2DToggle}
                        className={`hidden md:flex items-center bg-[#1E293B] text-[#93C5FD] px-4 py-2 rounded mx-2 hover:bg-[#2D3748] hover:text-white transition-colors duration-300 ${isLive2DModalOpen ? 'box-live' : ''}`}
                    >
                        <FaCircle className={`mr-2 ${isLive2DModalOpen ? 'text-green-500' : 'text-[#93C5FD]'}`} size={12} />
                        {['L', 'i', 'v', 'e'].map((char, index) => (
                            <motion.span
                                key={index}
                                initial={{ y: 0 }}
                                animate={isLive2DModalOpen ? { y: [-5, 0], color: ['#93C5FD', '#FFFFFF'] } : {}}
                                transition={{
                                    repeat: isLive2DModalOpen ? Infinity : 0,
                                    repeatType: "reverse",
                                    duration: 0.5,
                                    delay: index * 0.1
                                }}
                            >
                                {char}
                            </motion.span>
                        ))}
                    </motion.button>
                    <button
                        onClick={() => router.push('/leaderboard')}
                        className="flex items-center bg-[#1E293B] text-white px-4 py-2 rounded mx-2 hover:bg-[#2D3748] transition-colors duration-300 w-auto"
                    >
                        <FaTrophy className="mr-2" />
                        Bảng Xếp Hạng
                    </button>
                    <div
                        className="relative group"
                        ref={userDropdownRef}
                        onMouseEnter={() => user && handleMouseEnter(setIsUserDropdownOpen)}
                        onMouseLeave={() => user && handleMouseLeave(setIsUserDropdownOpen)}
                    >
                        <button
                            onClick={() => !user && router.push('/login')}
                            className="flex items-center bg-[#1E293B] text-white px-4 py-2 rounded mx-2 hover:bg-[#2D3748] transition-colors duration-300 w-auto"
                        >
                            <FaUserCircle className="mr-2" />
                            {user ? user.username : 'Đăng Nhập'}
                            {user && (isUserDropdownOpen ? <FaChevronUp className="ml-2" /> : <FaChevronDown className="ml-2" />)}
                        </button>
                        <AnimatePresence>
                            {user && isUserDropdownOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute top-full right-0 w-64 bg-[#1E293B] rounded-md shadow-lg z-10"
                                >
                                    <div className="p-4 space-y-2">
                                        <button
                                            onClick={() => {
                                                router.push('/account');
                                                setIsUserDropdownOpen(false);
                                            }}
                                            className="flex items-center w-full text-left py-2 px-3 text-white hover:bg-[#4B5563] rounded transition-colors duration-300"
                                        >
                                            <FaUser className="mr-3" />
                                            Tài Khoản
                                        </button>
                                        <button
                                            onClick={() => {
                                                handleLogout();
                                                setIsUserDropdownOpen(false);
                                            }}
                                            className="flex items-center w-full text-left py-2 px-3 text-white hover:bg-[#4B5563] rounded transition-colors duration-300"
                                        >
                                            <FaSignOutAlt className="mr-3" />
                                            Đăng Xuất
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DesktopNavBar;
