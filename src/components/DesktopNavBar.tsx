import React, { useRef } from 'react';
import { FaChevronDown, FaChevronUp, FaCircle, FaTools, FaSignOutAlt, FaUserCircle, FaUser, FaTrophy, FaImage } from 'react-icons/fa';
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
    setIsAIImageGenModalOpen: (isOpen: boolean) => void;
}

const DesktopNavBar: React.FC<DesktopNavBarProps> = ({
    isAIToolsDropdownOpen,
    setIsAIToolsDropdownOpen,
    setIsGeminiChatOpen,
    setIsAICompareModalOpen,
    isLive2DModalOpen,
    toggleLive2DModal,
    user,
    isUserDropdownOpen,
    setIsUserDropdownOpen,
    handleLogout,
    setIsAIImageGenModalOpen
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
                <div className="flex flex-row p-0 space-x-4">
                    <div
                        className="relative group"
                        ref={aiToolsRef}
                        onMouseEnter={() => handleMouseEnter(setIsAIToolsDropdownOpen)}
                        onMouseLeave={() => handleMouseLeave(setIsAIToolsDropdownOpen)}
                    >
                        <button className="nav-button group bg-gray-800 border border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-gray-800">
                            <FaTools className="mr-2" />
                            <span>Công Cụ AI</span>
                            {isAIToolsDropdownOpen ? <FaChevronUp className="ml-2" /> : <FaChevronDown className="ml-2" />}
                        </button>
                        <AnimatePresence>
                            {isAIToolsDropdownOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute top-full right-0 w-64 bg-gray-800 border border-blue-400 rounded-md shadow-lg z-50 mt-2"
                                >
                                    <div className="p-4 space-y-2">
                                        <button onClick={() => { setIsGeminiChatOpen(true); setIsAIToolsDropdownOpen(false); }} className="dropdown-item hover:bg-blue-400 hover:text-gray-800">
                                            <IoMdChatbubbles className="mr-3" />
                                            AI Hỗ Trợ
                                        </button>
                                        <button onClick={() => { setIsAICompareModalOpen(true); setIsAIToolsDropdownOpen(false); }} className="dropdown-item hover:bg-blue-400 hover:text-gray-800">
                                            <MdCompareArrows className="mr-3" />
                                            AI So Sánh
                                        </button>
                                        <button onClick={() => { setIsAIImageGenModalOpen(true); setIsAIToolsDropdownOpen(false); }} className="dropdown-item hover:bg-blue-400 hover:text-gray-800">
                                            <FaImage className="mr-3" />
                                            AI Tạo Ảnh
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    <motion.button
                        onClick={handleLive2DToggle}
                        className={`nav-button bg-gray-800 border ${isLive2DModalOpen ? 'box-live text-green-400' : 'border-gray-400 text-gray-400'} hover:bg-gray-700`}
                    >
                        <FaCircle className="mr-2" size={12} />
                        {['L', 'i', 'v', 'e'].map((char, index) => (
                            <motion.span
                                key={index}
                                initial={{ y: 0 }}
                                animate={isLive2DModalOpen ? { y: [-2, 0] } : {}}
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
                    <button onClick={() => router.push('/leaderboard')} className="nav-button bg-gray-800 border border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-gray-800">
                        <FaTrophy className="mr-2" />
                        <span>Bảng Xếp Hạng</span>
                    </button>
                    <div
                        className="relative group"
                        ref={userDropdownRef}
                        onMouseEnter={() => user && handleMouseEnter(setIsUserDropdownOpen)}
                        onMouseLeave={() => user && handleMouseLeave(setIsUserDropdownOpen)}
                    >
                        <button onClick={() => !user && router.push('/login')} className="nav-button bg-gray-800 border border-teal-400 text-teal-400 hover:bg-teal-400 hover:text-gray-800">
                            <FaUserCircle className="mr-2" />
                            <span>{user ? user.username : 'Đăng Nhập'}</span>
                            {user && (isUserDropdownOpen ? <FaChevronUp className="ml-2" /> : <FaChevronDown className="ml-2" />)}
                        </button>
                        <AnimatePresence>
                            {user && isUserDropdownOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute top-full right-0 w-64 bg-gray-800 border border-teal-400 rounded-md shadow-lg z-50 mt-2"
                                >
                                    <div className="p-4 space-y-2">
                                        <button onClick={() => { router.push('/account'); setIsUserDropdownOpen(false); }} className="dropdown-item hover:bg-teal-400 hover:text-gray-800">
                                            <FaUser className="mr-3" />
                                            Tài Khoản
                                        </button>
                                        <button onClick={() => { handleLogout(); setIsUserDropdownOpen(false); }} className="dropdown-item hover:bg-teal-400 hover:text-gray-800">
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
