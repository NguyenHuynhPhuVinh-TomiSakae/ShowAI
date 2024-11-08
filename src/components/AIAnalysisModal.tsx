import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSpinner, FaTimes, FaExpandAlt, FaCompressAlt } from 'react-icons/fa';
import { MdDragIndicator } from 'react-icons/md';
import { useMediaQuery } from 'react-responsive';

interface AIAnalysisModalProps {
    isOpen: boolean;
    onClose: () => void;
    content: React.ReactNode;
    isLoading: boolean;
    title: string;
}

const AIAnalysisModal: React.FC<AIAnalysisModalProps> = ({ isOpen, onClose, content, isLoading, title }) => {
    const isMobile = useMediaQuery({ maxWidth: 768 });
    const [isExpanded, setIsExpanded] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
        if (isExpanded) {
            setPosition({ x: 0, y: 0 });
        }
    };

    return (
        <AnimatePresence>
            {(isOpen || isLoading) && (
                <motion.div
                    drag
                    dragMomentum={false}
                    dragConstraints={{ left: -500, right: 500, top: -300, bottom: 300 }}
                    dragElastic={0.1}
                    onDragEnd={(event, info) => {
                        setPosition({
                            x: position.x + info.offset.x,
                            y: position.y + info.offset.y
                        });
                    }}
                    initial={{
                        opacity: 0,
                        scale: 0.95,
                        ...position
                    }}
                    animate={{
                        opacity: 1,
                        scale: 1,
                        ...position,
                        width: isExpanded ? (isMobile ? '100%' : '600px') : (isMobile ? '280px' : '320px'),
                        height: isExpanded ? (isMobile ? '100%' : '600px') : 'auto',
                    }}
                    exit={{
                        opacity: 0,
                        scale: 0.95,
                        ...position
                    }}
                    transition={{ duration: 0.2 }}
                    className={`absolute top-full right-0 mt-2
                        bg-gray-800/95 backdrop-blur-sm 
                        rounded-lg shadow-xl 
                        border border-blue-500/30 
                        overflow-hidden z-50
                        resize-y
                        ${isExpanded ? 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' : ''}
                        ${isMobile && isExpanded ? 'top-0 left-0 !translate-x-0 !translate-y-0' : ''}`}
                    style={{
                        minWidth: isMobile ? '280px' : '320px',
                        minHeight: isMobile ? '180px' : '200px',
                        maxHeight: isExpanded ? (isMobile ? '100vh' : '80vh') : '500px',
                    }}
                >
                    <div className="flex justify-between items-center p-3 
                        bg-gray-900/80 backdrop-blur-sm 
                        border-b border-blue-500/30
                        cursor-move"
                    >
                        <div className="flex items-center gap-2">
                            <MdDragIndicator className="text-gray-400" />
                            <h3 className="text-blue-400 font-medium">{title}</h3>
                        </div>
                        <div className="flex items-center gap-2">
                            {!isMobile && (
                                <button
                                    onClick={toggleExpand}
                                    className="text-gray-400 hover:text-gray-200 
                                        transition-colors p-1 rounded-lg
                                        hover:bg-gray-700/50"
                                >
                                    {isExpanded ? <FaCompressAlt /> : <FaExpandAlt />}
                                </button>
                            )}
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-200 
                                    transition-colors p-1 rounded-lg
                                    hover:bg-gray-700/50"
                            >
                                <FaTimes />
                            </button>
                        </div>
                    </div>
                    <div className={`p-4 overflow-y-auto transition-all duration-200
                        ${isExpanded ? 'h-[calc(100%-48px)]' : 'max-h-[calc(100vh-300px)]'}`}
                    >
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-8 space-y-3">
                                <FaSpinner className="animate-spin text-blue-400 text-2xl" />
                                <p className="text-gray-400">Đang phân tích...</p>
                            </div>
                        ) : (
                            <div className="text-gray-300 whitespace-pre-wrap">{content}</div>
                        )}
                    </div>
                    <div className="absolute bottom-0 right-0 w-4 h-4 
                        cursor-se-resize opacity-50 hover:opacity-100
                        transition-opacity duration-200"
                    >
                        <svg
                            className="w-full h-full text-blue-400"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M16 16L22 22M10 16L22 28M4 16L22 34"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                            />
                        </svg>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default AIAnalysisModal;
