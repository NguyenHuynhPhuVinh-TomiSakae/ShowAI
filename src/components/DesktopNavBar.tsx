import React, { useRef, useState } from 'react';
import { FaChevronDown, FaChevronUp, FaTools, FaSignOutAlt, FaUserCircle, FaUser, FaTrophy, FaCode, FaImage, FaComments, FaRobot, FaExchangeAlt, FaGamepad, FaTheaterMasks, FaGraduationCap, FaPortrait } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import type { MotionProps } from 'framer-motion';

type ModalBackdropProps = MotionProps & {
    className?: string;
};

interface DesktopNavBarProps {
    isAIToolsDropdownOpen: boolean;
    setIsAIToolsDropdownOpen: (isOpen: boolean) => void;
    setIsAIDesignModalOpen: (isOpen: boolean) => void;
    user: { username: string } | null;
    isUserDropdownOpen: boolean;
    setIsUserDropdownOpen: (isOpen: boolean) => void;
    handleLogout: () => void;
    setIsAIImageGenModalOpen: (isOpen: boolean) => void;
    setIsFileConversionModalOpen: (isOpen: boolean) => void;
    setIsAnimeGenModalOpen: (isOpen: boolean) => void;
    setIsHumanGenModalOpen: (isOpen: boolean) => void;
}

const DesktopNavBar: React.FC<DesktopNavBarProps> = ({
    isAIToolsDropdownOpen,
    setIsAIToolsDropdownOpen,
    user,
    isUserDropdownOpen,
    setIsUserDropdownOpen,
    handleLogout,
    setIsAIImageGenModalOpen,
    setIsFileConversionModalOpen,
    setIsAnimeGenModalOpen,
    setIsHumanGenModalOpen
}) => {
    const router = useRouter();
    const aiToolsRef = useRef<HTMLDivElement>(null);
    const userDropdownRef = useRef<HTMLDivElement>(null);
    const [isAIDropdownOpen, setIsAIDropdownOpen] = useState(false);

    const handleMouseEnter = (setDropdown: (isOpen: boolean) => void) => {
        setDropdown(true);
    };

    const handleMouseLeave = (setDropdown: (isOpen: boolean) => void) => {
        setDropdown(false);
    };

    return (
        <div className="hidden lg:flex lg:items-center">
            <div className="lg:relative lg:w-auto lg:bg-transparent lg:flex lg:items-center">
                <div className="flex flex-row p-0 space-x-4">
                    <div
                        className="relative group ai-hoverable"
                        ref={aiToolsRef}
                        onMouseEnter={() => handleMouseEnter(setIsAIToolsDropdownOpen)}
                        onMouseLeave={() => handleMouseLeave(setIsAIToolsDropdownOpen)}
                    >
                        <button
                            className="nav-button ai-hoverable bg-gray-800 border border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-gray-800"
                            data-description="Chứa các công cụ AI như tạo hình ảnh và chuyển đổi file"
                        >
                            <FaTools className="mr-2" />
                            <span>Hộp Công Cụ</span>
                            {isAIToolsDropdownOpen ? <FaChevronUp className="ml-2" /> : <FaChevronDown className="ml-2" />}
                        </button>
                        <AnimatePresence>
                            {isAIToolsDropdownOpen && (
                                <motion.div
                                    {...{
                                        initial: { opacity: 0, y: -10 },
                                        animate: { opacity: 1, y: 0 },
                                        exit: { opacity: 0, y: -10 },
                                        transition: { duration: 0.2 },
                                        className: "absolute top-full right-0 w-64 bg-gray-800 border border-blue-400 rounded-md shadow-lg z-50 mt-2"
                                    } as ModalBackdropProps}
                                >
                                    <div className="p-4 space-y-2">
                                        <button onClick={() => { setIsAIImageGenModalOpen(true); setIsAIToolsDropdownOpen(false); }} className="dropdown-item ai-hoverable hover:bg-blue-400 hover:text-gray-800">
                                            <FaImage className="mr-3" />
                                            Tạo Hình Ảnh
                                        </button>
                                        <button onClick={() => { setIsAnimeGenModalOpen(true); setIsAIToolsDropdownOpen(false); }} className="dropdown-item ai-hoverable hover:bg-blue-400 hover:text-gray-800">
                                            <FaTheaterMasks className="mr-3" />
                                            Tạo Ảnh Anime
                                        </button>
                                        <button onClick={() => { setIsHumanGenModalOpen(true); setIsAIToolsDropdownOpen(false); }} className="dropdown-item ai-hoverable hover:bg-blue-400 hover:text-gray-800">
                                            <FaPortrait className="mr-3" />
                                            Tạo Ảnh Người
                                        </button>
                                        <button onClick={() => { setIsFileConversionModalOpen(true); setIsAIToolsDropdownOpen(false); }} className="dropdown-item ai-hoverable hover:bg-blue-400 hover:text-gray-800">
                                            <FaExchangeAlt className="mr-3" />
                                            Chuyển Đổi Ảnh
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    <button onClick={() => router.push('/leaderboard')} className="nav-button ai-hoverable bg-gray-800 border border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-gray-800">
                        <FaTrophy className="mr-2" />
                        <span>Bảng Xếp Hạng</span>
                    </button>
                    <button onClick={() => router.push('/games')} className="nav-button ai-hoverable bg-gray-800 border border-purple-500 text-purple-500 hover:bg-purple-500 hover:text-gray-800">
                        <FaGamepad className="mr-2" />
                        <span>Trò Chơi</span>
                    </button>
                    <div
                        className="relative group ai-hoverable"
                        onMouseEnter={() => setIsAIDropdownOpen(true)}
                        onMouseLeave={() => setIsAIDropdownOpen(false)}
                    >
                        <button className="nav-button ai-hoverable bg-gray-800 border border-green-500 text-green-500 hover:bg-green-500 hover:text-gray-800">
                            <FaRobot className="mr-2" />
                            <span>AI</span>
                            {isAIDropdownOpen ? <FaChevronUp className="ml-2" /> : <FaChevronDown className="ml-2" />}
                        </button>
                        <AnimatePresence>
                            {isAIDropdownOpen && (
                                <motion.div
                                    {...{
                                        initial: { opacity: 0, y: -10 },
                                        animate: { opacity: 1, y: 0 },
                                        exit: { opacity: 0, y: -10 },
                                        transition: { duration: 0.2 },
                                        className: "absolute top-full right-0 w-64 bg-gray-800 border border-green-500 rounded-md shadow-lg z-50 mt-2"
                                    } as ModalBackdropProps}
                                >
                                    <div className="p-4 space-y-2">
                                        <button onClick={() => { router.push('/codebox'); setIsAIDropdownOpen(false); }} className="dropdown-item ai-hoverable hover:bg-green-500 hover:text-gray-800">
                                            <FaCode className="mr-3" />
                                            Tạo Mã
                                        </button>
                                        <button onClick={() => { router.push('/chatbox'); setIsAIDropdownOpen(false); }} className="dropdown-item ai-hoverable hover:bg-green-500 hover:text-gray-800">
                                            <FaComments className="mr-3" />
                                            Trò Chuyện
                                        </button>
                                        <button onClick={() => { router.push('/roleplay'); setIsAIDropdownOpen(false); }} className="dropdown-item ai-hoverable hover:bg-green-500 hover:text-gray-800">
                                            <FaTheaterMasks className="mr-3" />
                                            Nhập Vai
                                        </button>
                                        <button onClick={() => { router.push('/study'); setIsAIDropdownOpen(false); }} className="dropdown-item ai-hoverable hover:bg-green-500 hover:text-gray-800">
                                            <FaGraduationCap className="mr-3" />
                                            Học Tập
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    <div
                        className="relative group ai-hoverable"
                        ref={userDropdownRef}
                        onMouseEnter={() => user && handleMouseEnter(setIsUserDropdownOpen)}
                        onMouseLeave={() => user && handleMouseLeave(setIsUserDropdownOpen)}
                    >
                        <button onClick={() => !user && router.push('/login')} className="nav-button ai-hoverable bg-gray-800 border border-teal-400 text-teal-400 hover:bg-teal-400 hover:text-gray-800">
                            <FaUserCircle className="mr-2" />
                            <span>{user ? user.username : 'Đăng Nhập'}</span>
                            {user && (isUserDropdownOpen ? <FaChevronUp className="ml-2" /> : <FaChevronDown className="ml-2" />)}
                        </button>
                        <AnimatePresence>
                            {user && isUserDropdownOpen && (
                                <motion.div
                                    {...{
                                        initial: { opacity: 0, y: -10 },
                                        animate: { opacity: 1, y: 0 },
                                        exit: { opacity: 0, y: -10 },
                                        transition: { duration: 0.2 },
                                        className: "absolute top-full right-0 w-64 bg-gray-800 border border-teal-400 rounded-md shadow-lg z-50 mt-2"
                                    } as ModalBackdropProps}
                                >
                                    <div className="p-4 space-y-2">
                                        <button onClick={() => { router.push('/account'); setIsUserDropdownOpen(false); }} className="dropdown-item ai-hoverable hover:bg-teal-400 hover:text-gray-800">
                                            <FaUser className="mr-3" />
                                            Tài Khoản
                                        </button>
                                        <button onClick={() => { handleLogout(); setIsUserDropdownOpen(false); }} className="dropdown-item ai-hoverable hover:bg-teal-400 hover:text-gray-800">
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
