'use client'

import { motion } from 'framer-motion';
import { FaGamepad } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import type { MotionProps } from 'framer-motion';

type ModalBackdropProps = MotionProps & {
    className?: string;
};

export default function GamesPage() {
    const router = useRouter();

    return (
        <div className="bg-[#0F172A] text-white min-h-screen">
            <div className="bg-[#2A3284] text-center py-8 mb-8 px-4">
                <h1 className="text-2xl sm:text-3xl font-bold mb-4">Trò Chơi</h1>
                <p className="text-base sm:text-lg max-w-3xl mx-auto">
                    Chơi các trò chơi vô tận cùng AI.
                </p>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <motion.div
                        {...{
                            initial: { opacity: 0, y: 20 },
                            animate: { opacity: 1, y: 0 },
                            transition: { duration: 0.5 },
                            className: "bg-gray-800 p-8 rounded-lg shadow-lg text-center cursor-pointer hover:bg-gray-700",
                            onClick: () => router.push('/games/word-matching')
                        } as ModalBackdropProps}
                    >
                        <FaGamepad className="text-6xl sm:text-7xl text-green-400 mx-auto mb-6" />
                        <h2 className="text-xl sm:text-2xl font-bold text-green-300 mb-4">
                            Trò Chơi Ghép Từ
                        </h2>
                        <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto">
                            Ghép từ vô hạn với AI.
                        </p>
                    </motion.div>

                    <motion.div
                        {...{
                            initial: { opacity: 0, y: 20 },
                            animate: { opacity: 1, y: 0 },
                            transition: { duration: 0.5 },
                            className: "bg-gray-800 p-8 rounded-lg shadow-lg text-center cursor-pointer hover:bg-gray-700",
                            onClick: () => router.push('/games/sentiment-guess')
                        } as ModalBackdropProps}
                    >
                        <FaGamepad className="text-6xl sm:text-7xl text-purple-400 mx-auto mb-6" />
                        <h2 className="text-xl sm:text-2xl font-bold text-purple-300 mb-4">
                            Phán Đoán Cảm Xúc
                        </h2>
                        <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto">
                            Thử thách khả năng nhận biết cảm xúc trong câu văn cùng AI.
                        </p>
                    </motion.div>

                    <motion.div
                        {...{
                            initial: { opacity: 0, y: 20 },
                            animate: { opacity: 1, y: 0 },
                            transition: { duration: 0.5 },
                            className: "bg-gray-800 p-8 rounded-lg shadow-lg text-center cursor-pointer hover:bg-gray-700",
                            onClick: () => router.push('/games/ai-control')
                        } as ModalBackdropProps}
                    >
                        <FaGamepad className="text-6xl sm:text-7xl text-yellow-400 mx-auto mb-6" />
                        <h2 className="text-xl sm:text-2xl font-bold text-yellow-300 mb-4">
                            Điều Khiển AI
                        </h2>
                        <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto">
                            Thử thách khả năng điều khiển và tương tác với AI thông qua các câu lệnh.
                        </p>
                    </motion.div>

                    <motion.div
                        {...{
                            initial: { opacity: 0, y: 20 },
                            animate: { opacity: 1, y: 0 },
                            transition: { duration: 0.5 },
                            className: "bg-gray-800 p-8 rounded-lg shadow-lg text-center cursor-pointer hover:bg-gray-700",
                            onClick: () => router.push('/games/drawing-arena')
                        } as ModalBackdropProps}
                    >
                        <FaGamepad className="text-6xl sm:text-7xl text-blue-400 mx-auto mb-6" />
                        <h2 className="text-xl sm:text-2xl font-bold text-blue-300 mb-4">
                            Đấu Trường Hội Họa
                        </h2>
                        <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto">
                            Thử thách khả năng viết prompt và tạo hình ảnh với AI.
                        </p>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
