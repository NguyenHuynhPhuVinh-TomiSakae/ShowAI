'use client'

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaHandRock, FaHandPaper, FaHandScissors, FaSync } from 'react-icons/fa';
import { toast, Toaster } from 'react-hot-toast';
import ModalPortal from '@/components/ModalPortal';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

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

    const getAIChoice = async (playerMove: Choice): Promise<Choice> => {
        setIsLoading(true);
        try {
            const apiKeyResponse = await fetch('/api/Gemini');
            const apiKeyData = await apiKeyResponse.json();
            if (!apiKeyData.success) {
                throw new Error('Không lấy được khóa API');
            }

            const genAI = new GoogleGenerativeAI(apiKeyData.apiKey);
            const model = genAI.getGenerativeModel({
                model: "gemini-1.5-flash",
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

            // Tạo prompt với lịch sử
            const historyText = gameHistory
                .map(h => `Người chơi: ${h.playerMove}, AI: ${h.computerMove}, Kết quả: ${h.result}`)
                .join('\n');

            const prompt = `Lịch sử các lượt chơi trước:
${historyText}

Người chơi vừa chọn "${playerMove}".
Dựa vào lịch sử, hãy phân tích và đưa ra lựa chọn thông minh nhất.
CHỈ TRẢ VỀ một trong ba từ: "búa", "kéo" hoặc "bao", không kèm theo bất kỳ giải thích nào.`;

            const result = await model.generateContent(prompt);
            const aiChoice = result.response.text().trim().toLowerCase() as Choice;

            return choices.includes(aiChoice) ? aiChoice : choices[Math.floor(Math.random() * choices.length)];
        } catch (error) {
            console.error('Lỗi khi lấy lựa chọn của AI:', error);
            return choices[Math.floor(Math.random() * choices.length)];
        } finally {
            setIsLoading(false);
        }
    };

    const handleChoice = async (choice: Choice) => {
        const computerMove = await getAIChoice(choice);
        setPlayerChoice(choice);
        setComputerChoice(computerMove);

        const gameResult = determineWinner(choice, computerMove);
        setResult(gameResult);

        if (gameResult === 'thắng') {
            setScore(prev => ({ ...prev, player: prev.player + 1 }));
            toast.success('Bạn thắng! 🎉', toastStyle);
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
        </div>
    );
}
