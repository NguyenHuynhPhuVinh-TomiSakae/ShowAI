import React, { useRef } from 'react';
import { FaChevronDown, FaChevronUp, FaSignOutAlt, FaUserCircle, FaUser, FaTrophy } from 'react-icons/fa';
import { IoMdChatbubbles } from 'react-icons/io';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface DesktopNavBarProps {
    user: { username: string } | null;
    isUserDropdownOpen: boolean;
    setIsUserDropdownOpen: (isOpen: boolean) => void;
    handleLogout: () => void;
}

const DesktopNavBar: React.FC<DesktopNavBarProps> = ({
    user,
    isUserDropdownOpen,
    setIsUserDropdownOpen,
    handleLogout,
}) => {
    const router = useRouter();
    const userDropdownRef = useRef<HTMLDivElement>(null);

    const handleMouseEnter = (setDropdown: (isOpen: boolean) => void) => {
        setDropdown(true);
    };

    const handleMouseLeave = (setDropdown: (isOpen: boolean) => void) => {
        setDropdown(false);
    };

    return (
        <div className="hidden md:flex md:items-center">
            <div className="md:relative md:w-auto md:bg-transparent md:flex md:items-center">
                <div className="flex flex-row p-0 space-x-4">
                    <button onClick={() => router.push('/chat')} className="nav-button bg-gray-800 border border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-gray-800">
                        <IoMdChatbubbles className="mr-2" />
                        <span>ShowAIChat</span>
                    </button>
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
