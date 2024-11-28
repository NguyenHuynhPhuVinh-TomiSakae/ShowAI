import { IoClose } from 'react-icons/io5';
import { FaBars, FaPortrait } from 'react-icons/fa';
import { FaChevronDown, FaChevronUp, FaTools, FaSignOutAlt, FaUserCircle, FaUser, FaTrophy, FaCode, FaImage, FaComments, FaRobot, FaExchangeAlt, FaGamepad, FaTheaterMasks, FaGraduationCap } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import type { MotionProps } from 'framer-motion';

type ModalBackdropProps = MotionProps & {
    className?: string;
};

interface MobileNavBarProps {
    isSidebarOpen: boolean;
    toggleSidebar: () => void;
    isAIToolsDropdownOpen: boolean;
    toggleAIToolsDropdown: () => void;
    user: { username: string } | null;
    isUserDropdownOpen: boolean;
    toggleUserDropdown: () => void;
    handleLogout: () => void;
    setIsAIImageGenModalOpen: (isOpen: boolean) => void;
    setIsFileConversionModalOpen: (isOpen: boolean) => void;
    setIsAnimeGenModalOpen: (isOpen: boolean) => void;
    setIsHumanGenModalOpen: (isOpen: boolean) => void;
}

const MobileNavBar: React.FC<MobileNavBarProps> = ({
    isSidebarOpen,
    toggleSidebar,
    isAIToolsDropdownOpen,
    toggleAIToolsDropdown,
    user,
    isUserDropdownOpen,
    toggleUserDropdown,
    handleLogout,
    setIsAIImageGenModalOpen,
    setIsFileConversionModalOpen,
    setIsAnimeGenModalOpen,
    setIsHumanGenModalOpen
}) => {
    const router = useRouter();
    const sidebarRef = useRef<HTMLDivElement>(null);
    const [isAIDropdownOpen, setIsAIDropdownOpen] = useState(false);

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

    const handleGamesClick = () => {
        router.push('/games');
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
        <div className="lg:hidden">
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
                        {...{
                            initial: { x: '100%' },
                            animate: { x: 0 },
                            exit: { x: '100%' },
                            transition: { type: 'tween', duration: 0.3 },
                            className: "fixed top-0 right-0 h-full w-80 bg-gray-900 z-40 overflow-y-auto border-l border-gray-700 shadow-[0_0_15px_rgba(0,0,0,0.5)]"
                        } as ModalBackdropProps}
                    >
                        {/* Điều chỉnh padding và spacing cho nội dung */}
                        <div className="flex flex-col h-full">
                            <div className="flex items-center px-8 py-4 mt-3 border-b border-gray-700">
                                <p className="text-2xl font-bold text-white">ShowAI</p>
                            </div>
                            {/* Tăng padding và khoảng cách giữa các phần tử */}
                            <div className="flex-1 overflow-y-auto p-8 space-y-8">
                                {/* Các button và dropdown giữ nguyên nội dung nhưng điều chỉnh padding */}
                                <div className="bg-gray-800 rounded-lg p-3 border border-blue-400">
                                    <button
                                        onClick={toggleAIToolsDropdown}
                                        className="flex items-center justify-between w-full text-blue-400 py-2 px-3 hover:bg-blue-400 hover:text-gray-800 rounded transition-colors duration-300"
                                    >
                                        <span className="flex items-center">
                                            <FaTools className="mr-3" />
                                            Hộp Công Cụ
                                        </span>
                                        {isAIToolsDropdownOpen ? <FaChevronUp /> : <FaChevronDown />}
                                    </button>
                                    <AnimatePresence>
                                        {isAIToolsDropdownOpen && (
                                            <motion.div
                                                {...{
                                                    initial: { opacity: 0, height: 0 },
                                                    animate: { opacity: 1, height: 'auto' },
                                                    exit: { opacity: 0, height: 0 },
                                                    transition: { duration: 0.3 },
                                                    className: "mt-2 space-y-2 pl-6"
                                                } as ModalBackdropProps}
                                            >
                                                <button
                                                    onClick={() => {
                                                        setIsAIImageGenModalOpen(true);
                                                        toggleSidebar();
                                                    }}
                                                    className="dropdown-item text-blue-400 hover:bg-blue-400 hover:text-gray-800"
                                                >
                                                    <FaImage className="mr-3" />
                                                    Tạo Hình Ảnh
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setIsAnimeGenModalOpen(true);
                                                        toggleSidebar();
                                                    }}
                                                    className="dropdown-item text-blue-400 hover:bg-blue-400 hover:text-gray-800"
                                                >
                                                    <FaTheaterMasks className="mr-3" />
                                                    Tạo Ảnh Anime
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setIsHumanGenModalOpen(true);
                                                        toggleSidebar();
                                                    }}
                                                    className="dropdown-item text-blue-400 hover:bg-blue-400 hover:text-gray-800"
                                                >
                                                    <FaPortrait className="mr-3" />
                                                    Tạo Ảnh Người
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setIsFileConversionModalOpen(true);
                                                        toggleSidebar();
                                                    }}
                                                    className="dropdown-item text-blue-400 hover:bg-blue-400 hover:text-gray-800"
                                                >
                                                    <FaExchangeAlt className="mr-3" />
                                                    Chuyển Đổi Ảnh
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                                <button
                                    onClick={handleLeaderboardClick}
                                    className="nav-button w-full justify-center py-4 bg-gray-800 border border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-gray-800"
                                >
                                    <FaTrophy className="mr-4 text-xl" />
                                    Bảng Xếp Hạng
                                </button>
                                <button
                                    onClick={handleGamesClick}
                                    className="nav-button w-full justify-center py-4 bg-gray-800 border border-purple-500 text-purple-500 hover:bg-purple-500 hover:text-gray-800"
                                >
                                    <FaGamepad className="mr-4 text-xl" />
                                    Trò Chơi
                                </button>
                                <div className="bg-gray-800 rounded-lg p-3 border border-green-500">
                                    <button
                                        onClick={() => setIsAIDropdownOpen(!isAIDropdownOpen)}
                                        className="flex items-center justify-between w-full text-green-500 py-2 px-3 hover:bg-green-500 hover:text-gray-800 rounded transition-colors duration-300"
                                    >
                                        <span className="flex items-center">
                                            <FaRobot className="mr-3" />
                                            AI
                                        </span>
                                        {isAIDropdownOpen ? <FaChevronUp /> : <FaChevronDown />}
                                    </button>
                                    <AnimatePresence>
                                        {isAIDropdownOpen && (
                                            <motion.div
                                                {...{
                                                    initial: { opacity: 0, height: 0 },
                                                    animate: { opacity: 1, height: 'auto' },
                                                    exit: { opacity: 0, height: 0 },
                                                    transition: { duration: 0.3 },
                                                    className: "mt-2 space-y-2 pl-6"
                                                } as ModalBackdropProps}
                                            >
                                                <button
                                                    onClick={() => {
                                                        router.push('/codebox');
                                                        toggleSidebar();
                                                    }}
                                                    className="dropdown-item text-green-500 hover:bg-green-500 hover:text-gray-800"
                                                >
                                                    <FaCode className="mr-3" />
                                                    Tạo Mã
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        router.push('/chatbox');
                                                        toggleSidebar();
                                                    }}
                                                    className="dropdown-item text-green-500 hover:bg-green-500 hover:text-gray-800"
                                                >
                                                    <FaComments className="mr-3" />
                                                    Trò Chuyện
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        router.push('/roleplay');
                                                        toggleSidebar();
                                                    }}
                                                    className="dropdown-item text-green-500 hover:bg-green-500 hover:text-gray-800"
                                                >
                                                    <FaTheaterMasks className="mr-3" />
                                                    Nhập Vai
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        router.push('/study');
                                                        toggleSidebar();
                                                    }}
                                                    className="dropdown-item text-green-500 hover:bg-green-500 hover:text-gray-800"
                                                >
                                                    <FaGraduationCap className="mr-3" />
                                                    Học Tập
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                                {user ? (
                                    <div className="bg-gray-800 rounded-lg p-3 border border-teal-400">
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
                                                    {...{
                                                        initial: { opacity: 0, height: 0 },
                                                        animate: { opacity: 1, height: 'auto' },
                                                        exit: { opacity: 0, height: 0 },
                                                        transition: { duration: 0.3 },
                                                        className: "mt-2"
                                                    } as ModalBackdropProps}
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
                                        className="nav-button w-full justify-center py-4 bg-gray-800 border border-teal-400 text-teal-400 hover:bg-teal-400 hover:text-gray-800"
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
