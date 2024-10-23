'use client'

import { motion } from 'framer-motion';
import { FaTools } from 'react-icons/fa';

export default function GamesPage() {
    return (
        <div className="bg-[#0F172A] text-white min-h-screen">
            <div className="bg-[#2A3284] text-center py-8 mb-8 px-4">
                <h1 className="text-2xl sm:text-3xl font-bold mb-4">Trò Chơi</h1>
                <p className="text-base sm:text-lg max-w-3xl mx-auto">
                    Chơi các trò chơi vô tận cùng AI.
                </p>
            </div>

            <div className="container mx-auto px-4 py-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-gray-800 p-8 rounded-lg shadow-lg text-center"
                >
                    <FaTools className="text-6xl sm:text-7xl text-blue-400 mx-auto mb-6" />
                    <h2 className="text-xl sm:text-2xl font-bold text-blue-300 mb-4">
                        Tính năng đang được phát triển
                    </h2>
                    <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto">
                        Tôi đang nỗ lực phát triển tính năng trò chơi.
                        Vui lòng quay lại sau để trải nghiệm các trò chơi thú vị cùng AI.
                    </p>
                </motion.div>
            </div>
        </div>
    );
}

