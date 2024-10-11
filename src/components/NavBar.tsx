'use client'
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { IoClose, IoMenu } from 'react-icons/io5';
import { FaCircle, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import GeminiChat from './GeminiChat';
import AIDesignModal from './AIDesignModal';
import AICompareModal from './AICompareModal';
import Live2DModelComponent from './Live2DModelComponent';
import { motion, AnimatePresence } from 'framer-motion';

const NavBar = () => {
    const [isGeminiChatOpen, setIsGeminiChatOpen] = useState(false);
    const [isAIDesignModalOpen, setIsAIDesignModalOpen] = useState(false);
    const [isAICompareModalOpen, setIsAICompareModalOpen] = useState(false);
    const [isLive2DModalOpen, setIsLive2DModalOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isAIToolsDropdownOpen, setIsAIToolsDropdownOpen] = useState(false);
    const [navStyles, setNavStyles] = useState({
        bgColor: 'bg-[#3E52E8]',
        textColor: 'text-white',
        padding: 'p-4'
    });

    useEffect(() => {
        const storedNavStyles = localStorage.getItem('navStyles');
        if (storedNavStyles) {
            setNavStyles(JSON.parse(storedNavStyles));
        } else {
            localStorage.setItem('navStyles', JSON.stringify(navStyles));
        }

        const storedLive2DState = localStorage.getItem('isLive2DModalOpen');
        if (storedLive2DState) {
            setIsLive2DModalOpen(JSON.parse(storedLive2DState));
        }

        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setIsSidebarOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const toggleLive2DModal = () => {
        const newState = !isLive2DModalOpen;
        setIsLive2DModalOpen(newState);
        localStorage.setItem('isLive2DModalOpen', JSON.stringify(newState));
    };

    const toggleAIToolsDropdown = () => {
        if (window.innerWidth >= 768) {
            setIsAIToolsDropdownOpen(true);
        } else {
            setIsAIToolsDropdownOpen(!isAIToolsDropdownOpen);
        }
    };

    return (
        <nav className={`${navStyles.bgColor} ${navStyles.textColor} ${navStyles.padding}`}>
            <div className="container md:mx-4 flex justify-between items-center">
                <Link href="/" className="text-3xl font-bold">
                    <Image
                        src="/logo.jpg"
                        alt="ShowAI Logo"
                        className='rounded-full'
                        width={60}
                        height={60}
                        onMouseEnter={() => window.dispatchEvent(new CustomEvent('logoHover', { detail: 'Đây là logo của ShowAI, một nền tảng giúp bạn khám phá và tìm kiếm các công cụ AI hữu ích.' }))}
                        onMouseLeave={() => window.dispatchEvent(new CustomEvent('logoLeave'))}
                    />
                </Link>
                <div className="md:hidden">
                    <button onClick={toggleSidebar} className="text-white">
                        <IoMenu size={32} />
                    </button>
                </div>
                <div className={`fixed top-0 right-0 h-full w-64 bg-[#3E52E8] z-50 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'} md:relative md:translate-x-0 md:w-auto md:bg-transparent md:flex md:items-center`}>
                    <div className="flex flex-col h-full p-4 md:flex-row md:p-0">
                        <div className="flex justify-between items-center mb-4 md:hidden">
                            <p className="text-2xl font-bold">ShowAI</p>
                            <button
                                onClick={toggleSidebar}
                                className="text-white hover:text-gray-200 transition-colors duration-300"
                                aria-label="Close sidebar"
                            >
                                <IoClose size={28} />
                            </button>
                        </div>
                        <div className="relative group">
                            <button
                                onClick={toggleAIToolsDropdown}
                                onMouseEnter={() => window.innerWidth >= 768 && setIsAIToolsDropdownOpen(true)}
                                onMouseLeave={() => window.innerWidth >= 768 && setIsAIToolsDropdownOpen(false)}
                                className="text-white px-4 py-2 rounded mx-2 bg-[#1E293B] hover:bg-[#2D3748] transition-colors duration-300 w-full md:w-auto mb-0 flex items-center justify-between"
                            >
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
                                        className="absolute top-full left-0 w-full ml-2 md:ml-0 bg-[#1E293B] rounded-md shadow-lg z-10"
                                        onMouseEnter={() => window.innerWidth >= 768 && setIsAIToolsDropdownOpen(true)}
                                        onMouseLeave={() => window.innerWidth >= 768 && setIsAIToolsDropdownOpen(false)}
                                    >
                                        <button
                                            onClick={() => {
                                                setIsAIDesignModalOpen(true);
                                                setIsSidebarOpen(false);
                                                setIsAIToolsDropdownOpen(false);
                                            }}
                                            className="block w-full text-left px-4 py-2 text-white hover:bg-[#2D3748] transition-colors duration-300"
                                        >
                                            AI Giao Diện
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsGeminiChatOpen(true);
                                                setIsSidebarOpen(false);
                                                setIsAIToolsDropdownOpen(false);
                                            }}
                                            className="block w-full text-left px-4 py-2 text-white hover:bg-[#2D3748] transition-colors duration-300"
                                        >
                                            AI Hỗ Trợ
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsAICompareModalOpen(true);
                                                setIsSidebarOpen(false);
                                                setIsAIToolsDropdownOpen(false);
                                            }}
                                            className="block w-full text-left px-4 py-2 text-white hover:bg-[#2D3748] transition-colors duration-300"
                                        >
                                            AI So Sánh
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        <motion.button
                            onClick={toggleLive2DModal}
                            className={`hidden md:flex items-center bg-[#1E293B] text-[#93C5FD] px-4 py-2 rounded mx-2 hover:bg-[#2D3748] hover:text-white transition-colors duration-300 ${isLive2DModalOpen ? 'box-live' : ''
                                }`}
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
                    </div>
                </div>
            </div>
            {isAIDesignModalOpen && (
                <AIDesignModal isOpen={isAIDesignModalOpen} onClose={() => setIsAIDesignModalOpen(false)} />
            )}
            {isAICompareModalOpen && (
                <AICompareModal isOpen={isAICompareModalOpen} onClose={() => setIsAICompareModalOpen(false)} />
            )}
            {isLive2DModalOpen && (
                <Live2DModelComponent />
            )}
            {isGeminiChatOpen && (
                <GeminiChat isOpen={isGeminiChatOpen} onClose={() => setIsGeminiChatOpen(false)} />
            )}
        </nav>
    );
};

export default NavBar;