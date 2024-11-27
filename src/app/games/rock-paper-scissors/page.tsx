'use client'

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaHandRock, FaHandPaper, FaHandScissors, FaSync } from 'react-icons/fa';
import { toast, Toaster } from 'react-hot-toast';
import ModalPortal from '@/components/ModalPortal';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import LeaderboardModal from '@/components/LeaderboardModal';
import { useFirebase } from '@/components/FirebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { useSupabase } from '@/hooks/useSupabase';

type Choice = 'búa' | 'kéo' | 'bao';
type GameResult = 'thắng' | 'thua' | 'hòa' | null;

const choices: Choice[] = ['kéo', 'búa', 'bao'];

const choiceIcons = {
    búa: FaHandRock,
    kéo: FaHandScissors,
    bao: FaHandPaper,
};

// Thêm style cho toast
const toastStyle = {
    style: {
        background: '#1E293B',
        color: '#fff',
        border: '1px solid #3B82F6',
        borderRadius: '0.5rem',
        padding: '1rem',
    },
};

const IconSkeleton = () => (
    <div className="text-6xl mb-4 flex justify-center">
        <Skeleton
            width={96}
            height={96}
            baseColor="#1F2937"
            highlightColor="#374151"
            borderRadius={12}
        />
    </div>
);

// Thêm type cho lịch sử game
type GameHistory = {
    playerMove: Choice;
    computerMove: Choice;
    result: GameResult;
}[];

export default function RockPaperScissorsGame() {
    const [playerChoice, setPlayerChoice] = useState<Choice | null>(null);
    const [computerChoice, setComputerChoice] = useState<Choice | null>(null);
    const [, setResult] = useState<GameResult>(null);
    const [score, setScore] = useState({ player: 0, computer: 0 });
    const [isLoading, setIsLoading] = useState(false);
    const [gameHistory, setGameHistory] = useState<GameHistory>([]);
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const { auth, db } = useFirebase();
    const { supabase, loading: supabaseLoading } = useSupabase();

    const determineWinner = (player: Choice, computer: Choice): GameResult => {
        if (player === computer) return 'hòa';
        if (
            (player === 'búa' && computer === 'kéo') ||
            (player === 'kéo' && computer === 'bao') ||
            (player === 'bao' && computer === 'búa')
        ) {
            return 'thắng';
        }
        return 'thua';
    };

    const getAIChoice = async (): Promise<Choice> => {
        setIsLoading(true);
        try {
            const apiKeyResponse = await fetch('/api/Gemini4');
            const apiKeyData = await apiKeyResponse.json();
            if (!apiKeyData.success) {
                throw new Error('Không lấy được khóa API');
            }

            const genAI = new GoogleGenerativeAI(apiKeyData.apiKey);
            const model = genAI.getGenerativeModel({
                model: "gemini-exp-1121",
                generationConfig: {
                    temperature: 1,
                    topP: 0.95,
                    topK: 40,
                    maxOutputTokens: 8192,
                },
                safetySettings: [
                    {
                        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                        threshold: HarmBlockThreshold.BLOCK_NONE
                    },
                    {
                        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                        threshold: HarmBlockThreshold.BLOCK_NONE
                    },
                    {
                        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                        threshold: HarmBlockThreshold.BLOCK_NONE
                    },
                    {
                        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                        threshold: HarmBlockThreshold.BLOCK_NONE
                    }
                ]
            });

            // Sửa lại prompt để không tiết lộ lựa chọn hiện tại
            const historyText = gameHistory
                .slice(-5) // Chỉ lấy 5 lượt chơi gần nhất
                .map(h => `Người chơi: ${h.playerMove}, AI: ${h.computerMove}, Kết quả: ${h.result}`)
                .join('\n');

            const prompt = `Bạn là AI chơi kéo búa bao. Dựa vào lịch sử 5 lượt gần nhất:
${historyText}

Hãy phân tích pattern của người chơi và đưa ra lựa chọn thông minh để thắng. Ví dụ:
- Nếu người chơi thường chọn lặp lại các nước đi
- Nếu người chơi có xu hướng thay đổi sau khi thua
- Nếu người chơi thích dùng một lựa chọn cụ thể

CHỈ TRẢ VỀ một trong ba từ: "búa", "kéo" hoặc "bao" (không kèm giải thích).`;

            const result = await model.generateContent(prompt);
            const aiChoice = result.response.text().trim().toLowerCase() as Choice;

            // Nếu không có lịch sử hoặc AI trả về không hợp lệ, chọn ngẫu nhiên
            if (!gameHistory.length || !choices.includes(aiChoice)) {
                return choices[Math.floor(Math.random() * choices.length)];
            }

            return aiChoice;
        } catch (error) {
            console.error('Lỗi khi lấy lựa chọn của AI:', error);
            return choices[Math.floor(Math.random() * choices.length)];
        } finally {
            setIsLoading(false);
        }
    };

    const updateLeaderboard = async () => {
        if (!auth?.currentUser || !db || !supabase || supabaseLoading) return;

        try {
            const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
            const userData = userDoc.data();

            const { data: existingRecord } = await supabase
                .from('rockpaperscissors_leaderboard')
                .select('wins')
                .eq('firebase_id', auth.currentUser.uid)
                .single();

            const { error } = await supabase
                .from('rockpaperscissors_leaderboard')
                .upsert(
                    {
                        firebase_id: auth.currentUser.uid,
                        display_name: userData?.displayName || 'Người chơi ẩn danh',
                        wins: existingRecord ? existingRecord.wins + 1 : 1,
                    },
                    { onConflict: 'firebase_id' }
                );

            if (error) throw error;
        } catch (error) {
            console.error('Lỗi khi cập nhật bảng xếp hạng:', error);
        }
    };

    const handleChoice = async (choice: Choice) => {
        const computerMove = await getAIChoice();
        setPlayerChoice(choice);
        setComputerChoice(computerMove);

        const gameResult = determineWinner(choice, computerMove);
        setResult(gameResult);

        if (gameResult === 'thắng') {
            setScore(prev => ({ ...prev, player: prev.player + 1 }));
            toast.success('Bạn thắng! 🎉', toastStyle);
            updateLeaderboard();
        } else if (gameResult === 'thua') {
            setScore(prev => ({ ...prev, computer: prev.computer + 1 }));
            toast.error('Bạn thua! 😢', toastStyle);
        } else {
            toast('Hòa! 🤝', toastStyle);
        }

        // Cập nhật lịch sử
        setGameHistory(prev => [...prev, {
            playerMove: choice,
            computerMove: computerMove,
            result: gameResult
        }]);
    };

    const resetGame = () => {
        setPlayerChoice(null);
        setComputerChoice(null);
        setResult(null);
        setScore({ player: 0, computer: 0 });
        setGameHistory([]); // Reset lịch sử
    };

    return (
        <div className="bg-[#0F172A] text-white min-h-screen">
            <ModalPortal>
                <Toaster position="top-center" />
            </ModalPortal>

            <div className="bg-[#2A3284] text-center py-8 mb-8 px-4">
                <h1 className="text-2xl sm:text-3xl font-bold mb-4">Kéo Búa Bao</h1>
                <p className="text-base sm:text-lg max-w-3xl mx-auto">
                    Chọn một trong ba để đấu với AI thông minh!
                </p>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-center gap-4 mb-8">
                    <button
                        onClick={resetGame}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg"
                        disabled={isLoading}
                    >
                        <FaSync className={isLoading ? 'animate-spin' : ''} />
                        Chơi lại
                    </button>
                    <button
                        onClick={() => setShowLeaderboard(true)}
                        className="bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded-lg"
                        disabled={isLoading}
                    >
                        Bảng xếp hạng
                    </button>
                </div>

                <div className="text-center mb-8">
                    <div className="text-xl font-bold">
                        Tỉ số: Bạn {score.player} - {score.computer} AI
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-8 max-w-4xl mx-auto mb-8">
                    <div className="text-center">
                        <h2 className="text-xl font-bold mb-4">Bạn</h2>
                        {isLoading ? (
                            <IconSkeleton />
                        ) : (
                            <motion.div
                                className="text-6xl mb-4"
                                initial={{ scale: 0 }}
                                animate={{ scale: playerChoice ? 1 : 0 }}
                                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                            >
                                {playerChoice && choiceIcons[playerChoice]?.({ className: "mx-auto" })}
                            </motion.div>
                        )}
                    </div>

                    <div className="text-center">
                        <h2 className="text-xl font-bold mb-4">AI</h2>
                        {isLoading ? (
                            <IconSkeleton />
                        ) : (
                            <motion.div
                                className="text-6xl mb-4"
                                initial={{ scale: 0 }}
                                animate={{ scale: computerChoice ? 1 : 0 }}
                                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                            >
                                {computerChoice && choiceIcons[computerChoice]?.({ className: "mx-auto" })}
                            </motion.div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
                    {choices.map((choice) => {
                        const Icon = choiceIcons[choice];
                        return (
                            <motion.button
                                key={choice}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleChoice(choice)}
                                disabled={isLoading}
                                className={`p-6 rounded-lg transition-all ${isLoading
                                    ? 'bg-gray-700 opacity-50 cursor-not-allowed'
                                    : 'bg-purple-600 hover:bg-purple-700'
                                    } flex flex-col items-center gap-2`}
                            >
                                <Icon className={`text-4xl ${isLoading ? 'animate-pulse' : ''}`} />
                                <span className="capitalize">{choice}</span>
                            </motion.button>
                        );
                    })}
                </div>
            </div>

            <LeaderboardModal
                isOpen={showLeaderboard}
                onClose={() => setShowLeaderboard(false)}
                tableName="rockpaperscissors_leaderboard"
            />
        </div>
    );
}