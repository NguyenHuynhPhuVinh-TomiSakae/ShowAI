/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSupabase } from '@/hooks/useSupabase';
import ModalPortal from './ModalPortal';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

type LeaderboardEntry = {
    firebase_id: string;
    display_name: string;
    wins: number;
};

interface LeaderboardModalProps {
    isOpen: boolean;
    onClose: () => void;
    tableName: string;
}

const LeaderboardSkeleton = () => (
    <div className="space-y-2">
        {Array(10).fill(null).map((_, index) => (
            <div key={index} className="flex items-center justify-between bg-gray-700 p-3 rounded">
                <div className="flex items-center gap-3">
                    <span className="text-yellow-400 font-bold">{index + 1}</span>
                    <Skeleton
                        width={120}
                        baseColor="#1F2937"
                        highlightColor="#374151"
                    />
                </div>
                <Skeleton
                    width={60}
                    baseColor="#1F2937"
                    highlightColor="#374151"
                />
            </div>
        ))}
    </div>
);

const EmptyLeaderboard = () => (
    <div className="flex flex-col items-center justify-center py-8">
        <div className="text-gray-400 text-center">
            <svg
                className="mx-auto h-12 w-12 mb-4 opacity-50"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
            </svg>
            <p className="text-lg font-semibold">Chưa có ai</p>
            <p className="text-sm mt-2">Hãy là người đầu tiên trên bảng xếp hạng!</p>
        </div>
    </div>
);

const LeaderboardModal = ({ isOpen, onClose, tableName }: LeaderboardModalProps) => {
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { supabase, loading: supabaseLoading, error: supabaseError } = useSupabase();

    useEffect(() => {
        const fetchLeaderboard = async () => {
            if (!supabase || supabaseLoading) return;

            try {
                const { data, error } = await supabase
                    .from(tableName)
                    .select('*')
                    .order('wins', { ascending: false })
                    .limit(10);

                if (error) throw error;

                const processedData = (data || []).map((entry: any) => ({
                    ...entry,
                    display_name: entry.display_name?.startsWith('User')
                        ? 'Người dùng ẩn danh'
                        : entry.display_name || 'Người dùng ẩn danh'
                }));

                setLeaderboard(processedData);
            } catch (error) {
                console.error('Lỗi khi tải bảng xếp hạng:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (isOpen) {
            fetchLeaderboard();
        }
    }, [isOpen, supabase, supabaseLoading, tableName]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    if (supabaseError) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-gray-800 p-6 rounded-lg">
                    <p className="text-red-500">Lỗi: {supabaseError}</p>
                    <button
                        onClick={onClose}
                        className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        );
    }

    return (
        <ModalPortal>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4 overflow-y-auto">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md my-8"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-white">Bảng Xếp Hạng</h2>
                        <div className="h-8 w-8 bg-yellow-400 rounded-full flex items-center justify-center">
                            <span className="text-gray-900 font-bold text-sm">👑</span>
                        </div>
                    </div>

                    {isLoading ? (
                        <LeaderboardSkeleton />
                    ) : leaderboard.length === 0 ? (
                        <EmptyLeaderboard />
                    ) : (
                        <div className="space-y-2">
                            {leaderboard.map((entry, index) => (
                                <motion.div
                                    key={entry.firebase_id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className={`flex items-center justify-between p-3 rounded ${index === 0
                                        ? 'bg-yellow-500/20 border border-yellow-500/50'
                                        : index === 1
                                            ? 'bg-gray-500/20 border border-gray-500/50'
                                            : index === 2
                                                ? 'bg-orange-500/20 border border-orange-500/50'
                                                : 'bg-gray-700'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-6 h-6 flex items-center justify-center rounded-full
                                            ${index === 0
                                                ? 'bg-yellow-500 text-black'
                                                : index === 1
                                                    ? 'bg-gray-400 text-black'
                                                    : index === 2
                                                        ? 'bg-orange-500 text-black'
                                                        : 'bg-gray-600 text-white'
                                            }`}
                                        >
                                            <span className="font-bold text-sm">{index + 1}</span>
                                        </div>
                                        <span className="text-white font-medium">{entry.display_name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-green-400 font-bold">{entry.wins}</span>
                                        <span className="text-green-400 text-sm">thắng</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    <button
                        onClick={onClose}
                        className="mt-6 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2.5 px-4 rounded-lg w-full transition-colors duration-200 flex items-center justify-center gap-2"
                    >
                        <span>Đóng</span>
                    </button>
                </motion.div>
            </div>
        </ModalPortal>
    );
};

export default LeaderboardModal;
