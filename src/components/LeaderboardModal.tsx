/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useFirebase } from '@/components/FirebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { useSupabase } from '@/hooks/useSupabase';
import ModalPortal from './ModalPortal';

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

const LeaderboardModal = ({ isOpen, onClose, tableName }: LeaderboardModalProps) => {
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { db } = useFirebase();
    const { supabase, loading: supabaseLoading, error: supabaseError } = useSupabase();

    useEffect(() => {
        const fetchLeaderboard = async () => {
            if (!db || !supabase || supabaseLoading) return;

            try {
                const { data, error } = await supabase
                    .from(tableName)
                    .select('*')
                    .order('wins', { ascending: false })
                    .limit(10);

                if (error) throw error;

                const leaderboardWithNames = await Promise.all(
                    (data || []).map(async (entry: any) => {
                        try {
                            const userDoc = await getDoc(doc(db, 'users', entry.firebase_id));
                            const userData = userDoc.data();
                            return {
                                ...entry,
                                display_name: userData?.displayName || 'Người chơi ẩn danh'
                            };
                        } catch (error) {
                            return {
                                ...entry,
                                display_name: 'Người chơi ẩn danh'
                            };
                        }
                    })
                );

                setLeaderboard(leaderboardWithNames);
            } catch (error) {
                console.error('Lỗi khi tải bảng xếp hạng:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (isOpen) {
            fetchLeaderboard();
        }
    }, [isOpen, db, supabase, supabaseLoading, tableName]);

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
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md"
                >
                    <h2 className="text-xl font-bold mb-4 text-white">Bảng Xếp Hạng</h2>
                    {isLoading ? (
                        <div className="text-white">Đang tải...</div>
                    ) : (
                        <div className="space-y-2">
                            {leaderboard.map((entry, index) => (
                                <div
                                    key={entry.firebase_id}
                                    className="flex items-center justify-between bg-gray-700 p-3 rounded"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-yellow-400 font-bold">{index + 1}</span>
                                        <span className="text-white">{entry.display_name}</span>
                                    </div>
                                    <span className="text-green-400 font-bold">{entry.wins} thắng</span>
                                </div>
                            ))}
                        </div>
                    )}
                    <button
                        onClick={onClose}
                        className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded w-full"
                    >
                        Đóng
                    </button>
                </motion.div>
            </div>
        </ModalPortal>
    );
};

export default LeaderboardModal;
