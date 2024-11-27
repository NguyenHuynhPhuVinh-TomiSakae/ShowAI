import React, { useEffect } from 'react';
import { IoClose } from "react-icons/io5";
import { FaRobot, FaGoogle } from "react-icons/fa";
import { motion, AnimatePresence } from 'framer-motion';
import type { MotionProps } from 'framer-motion';

interface BotSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectBot: (bot: 'gemini' | 'showai' | 'marco') => void;
}

type ModalBackdropProps = MotionProps & {
    className?: string;
};

const BotSelectionModal: React.FC<BotSelectionModalProps> = ({ isOpen, onClose, onSelectBot }) => {
    useEffect(() => {
        if (isOpen) {
            // Khóa cuộn khi modal mở
            document.body.style.overflow = 'hidden';
        } else {
            // Mở khóa cuộn khi modal đóng
            document.body.style.overflow = 'unset';
        }

        // Cleanup function để đảm bảo mở khóa cuộn khi component unmount
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                {...{
                    initial: { opacity: 0 },
                    animate: { opacity: 1 },
                    exit: { opacity: 0 },
                    transition: { duration: 0.3 },
                    className: "fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-6"
                } as ModalBackdropProps}
            >
                <motion.div
                    {...{
                        initial: { scale: 0.9, opacity: 0 },
                        animate: { scale: 1, opacity: 1 },
                        exit: { scale: 0.9, opacity: 0 },
                        transition: { duration: 0.3 },
                        className: "bg-[#0F172A] rounded-xl shadow-2xl p-4 sm:p-6 w-full max-w-[95%] sm:max-w-3xl border border-[#3E52E8]/20"
                    } as ModalBackdropProps}
                >
                    <div className="flex justify-between items-center mb-4 sm:mb-6">
                        <h2 className="text-lg sm:text-xl font-bold text-white">Chọn Trợ Lý AI</h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
                        >
                            <IoClose className="h-5 w-5 text-white/70 hover:text-white" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => onSelectBot('gemini')}
                            className="p-6 border border-[#3E52E8]/20 rounded-xl hover:bg-[#1E293B] 
                                     transition-colors duration-300 flex flex-col items-center 
                                     bg-[#0F172A]/50"
                        >
                            <div className="w-16 h-16 mb-4 flex items-center justify-center 
                                          bg-gradient-to-br from-blue-500 to-green-500 rounded-full">
                                <FaGoogle className="h-8 w-8 text-white" />
                            </div>
                            <span className="font-medium text-white">Gemini AI</span>
                            <span className="text-sm text-gray-400 mt-2 text-center">
                                Google Gemini AI
                            </span>
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => onSelectBot('showai')}
                            className="p-6 border border-[#3E52E8]/20 rounded-xl hover:bg-[#1E293B] 
                                     transition-colors duration-300 flex flex-col items-center 
                                     bg-[#0F172A]/50"
                        >
                            <div className="w-16 h-16 mb-4 flex items-center justify-center 
                                          bg-gradient-to-br from-[#3E52E8] to-[#6B46C1] rounded-full">
                                <FaRobot className="h-8 w-8 text-white" />
                            </div>
                            <span className="font-medium text-white">TomiSakae</span>
                            <span className="text-sm text-gray-400 mt-2 text-center">
                                AI trò chuyện vui vẻ
                            </span>
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => onSelectBot('marco')}
                            className="p-6 border border-[#3E52E8]/20 rounded-xl hover:bg-[#1E293B] 
                                     transition-colors duration-300 flex flex-col items-center 
                                     bg-[#0F172A]/50"
                        >
                            <div className="w-16 h-16 mb-4 flex items-center justify-center 
                                          bg-gradient-to-br from-purple-500 to-pink-500 rounded-full">
                                <FaRobot className="h-8 w-8 text-white" />
                            </div>
                            <span className="font-medium text-white">GLHF</span>
                            <span className="text-sm text-gray-400 mt-2 text-center">
                                Tổng hợp nhiều mô hình AI
                            </span>
                        </motion.button>
                    </div>

                    <div className="text-center text-xs sm:text-sm text-gray-400">
                        Chọn trợ lý AI phù hợp với nhu cầu của bạn
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default BotSelectionModal;