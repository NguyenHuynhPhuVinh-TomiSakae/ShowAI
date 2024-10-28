'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import GameRooms from './components/GameRooms';

export default function AIGamePage() {
    const [nickname, setNickname] = useState('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [showRooms, setShowRooms] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!nickname.trim()) {
            setErrorMessage('Vui lòng nhập biệt danh của bạn');
            return;
        }
        // Lưu nickname vào localStorage
        localStorage.setItem('nickname', nickname.trim());
        setShowRooms(true);
    };

    const handleViewRooms = () => {
        if (!nickname.trim()) {
            setErrorMessage('Vui lòng nhập biệt danh của bạn');
            return;
        }
        // Lưu nickname vào localStorage
        localStorage.setItem('nickname', nickname.trim());
        setShowRooms(true);
    };

    if (showRooms) {
        return <GameRooms nickname={nickname} />;
    }

    return (
        <div className="bg-[#0F172A] text-white min-h-screen">
            <div className="bg-[#2A3284] text-center py-8 px-4">
                <h1 className="text-2xl sm:text-3xl font-bold mb-4">Đấu Trường AI</h1>
                <p className="text-base sm:text-lg max-w-3xl mx-auto">
                    Tham gia đấu trường AI, nơi bạn có thể thách đấu với các người chơi khác thông qua các thử thách về AI.
                </p>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="container mx-auto px-4 py-8"
            >
                <div className="max-w-2xl mx-auto">
                    <div className="bg-gray-800/90 backdrop-blur-sm p-6 md:p-8 rounded-2xl shadow-xl border border-gray-700">
                        <h2 className="text-xl font-semibold mb-6 text-blue-300">CHƠI NGAY</h2>

                        {errorMessage && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-red-500/80 backdrop-blur text-white p-4 mb-6 rounded-lg shadow flex items-center"
                            >
                                <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" />
                                </svg>
                                <p>{errorMessage}</p>
                            </motion.div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label htmlFor="nickname" className="block text-blue-300 text-sm font-semibold">
                                    Biệt danh <span className="text-red-400">*</span>
                                </label>
                                <input
                                    id="nickname"
                                    type="text"
                                    value={nickname}
                                    onChange={(e) => setNickname(e.target.value)}
                                    placeholder="Nhập biệt danh của bạn"
                                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all text-white"
                                    required
                                />
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={handleViewRooms}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg transition duration-300 disabled:opacity-50"
                                    disabled={!nickname}
                                >
                                    CÁC PHÒNG
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white py-3 px-6 rounded-lg transition duration-300 disabled:opacity-50 font-medium shadow-lg hover:shadow-xl"
                                    disabled={!nickname}
                                >
                                    CHƠI NGAY!
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
