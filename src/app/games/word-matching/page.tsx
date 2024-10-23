'use client'

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaSync } from 'react-icons/fa';
import { toast, Toaster } from 'react-hot-toast';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import ModalPortal from '@/components/ModalPortal';

interface Word {
    word: string;
    isMatched: boolean;
    isBase?: boolean;
    combination?: string;
}

const toastStyle = {
    style: {
        background: '#1E293B',
        color: '#fff',
        border: '1px solid #3B82F6',
        borderRadius: '0.5rem',
        padding: '1rem',
    },
};

export default function WordMatchingGame() {
    const [words, setWords] = useState<Word[]>([]);
    const [selectedWords, setSelectedWords] = useState<Word[]>([]);
    const [score, setScore] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [discoveredCombinations, setDiscoveredCombinations] = useState<string[]>([]);

    useEffect(() => {
        initializeGame();
    }, []);

    const initializeGame = () => {
        const baseWords: Word[] = [
            { word: "Đất", isMatched: false, isBase: true },
            { word: "Nước", isMatched: false, isBase: true },
            { word: "Lửa", isMatched: false, isBase: true },
            { word: "Gió", isMatched: false, isBase: true },
        ];

        setWords(baseWords);
        setSelectedWords([]);
        setScore(0);
        setDiscoveredCombinations([]);
    };

    const generateCombination = async (word1: string, word2: string) => {
        try {
            const apiKeyResponse = await fetch('/api/Gemini');
            const apiKeyData = await apiKeyResponse.json();
            if (!apiKeyData.success) {
                throw new Error('Không lấy được khóa API');
            }
            const apiKey = apiKeyData.apiKey;
            const genAI = new GoogleGenerativeAI(apiKey);

            // Thêm cấu hình safety settings
            const model = genAI.getGenerativeModel({
                model: "gemini-1.5-flash",
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

            const prompt = `Hãy tạo ra một từ mới bằng cách kết hợp ý nghĩa của hai từ "${word1}" và "${word2}". 
            Kết quả phải là một từ hoàn toàn mới có ý nghĩa liên quan đến cả hai từ gốc, KHÔNG ĐƯỢC đơn thuần ghép hai từ lại với nhau.
            CHỈ TRẢ VỀ KẾT QUẢ, không kèm theo giải thích, markdown hay bất kỳ nội dung nào khác.
            Ví dụ: 
            - nếu input là "Đất" và "Nước" thì output là "Bùn"
            - nếu input là "Lửa" và "Gió" thì output là "Nhiệt"
            Nếu không thể tạo ra từ mới có ý nghĩa, hãy trả về "không thể"`;

            const result = await model.generateContent(prompt);
            const combination = result.response.text().trim();

            // Kiểm tra xem kết quả có phải là sự ghép nối đơn thuần không
            const combinedWords = `${word1} ${word2}`.toLowerCase();
            if (combination.toLowerCase() === combinedWords ||
                combination.toLowerCase() === `${word2} ${word1}`.toLowerCase()) {
                return null;
            }

            return combination;
        } catch (error) {
            console.error('Lỗi khi tạo kết hợp:', error);
            return null;
        }
    };

    const handleWordClick = async (word: Word) => {
        if (word.isMatched || isLoading) return;

        // Bỏ điều kiện kiểm tra isBase
        if (selectedWords.length < 2) {
            setSelectedWords(prev => [...prev, word]);
        }
    };

    useEffect(() => {
        const processCombination = async () => {
            if (selectedWords.length === 2) {
                setIsLoading(true);
                const [word1, word2] = selectedWords;

                // Kiểm tra kết hợp đã tồn tại
                const combinationKey = [word1.word, word2.word].sort().join('-');
                if (discoveredCombinations.includes(combinationKey)) {
                    toast.error('Kết hợp này đã được tìm ra!', toastStyle);
                    setSelectedWords([]);
                    setIsLoading(false);
                    return;
                }

                const combination = await generateCombination(word1.word, word2.word);

                if (combination && combination.toLowerCase() !== "không thể") {
                    // Kiểm tra xem từ mới đã tồn tại trong danh sách chưa
                    const isWordExists = words.some(w => w.word.toLowerCase() === combination.toLowerCase());

                    if (!isWordExists) {
                        setWords(prevWords => [...prevWords, {
                            word: combination,
                            isMatched: false,
                            isBase: false,
                            combination: `${word1.word} + ${word2.word}`
                        }]);
                        setScore(prev => prev + 1);
                        setDiscoveredCombinations(prev => [...prev, combinationKey]);
                        toast.success('Đã tạo kết hợp mới!', toastStyle);
                    } else {
                        toast.error('Từ này đã tồn tại!', toastStyle);
                    }
                } else {
                    toast.error('Không thể kết hợp hai từ này!', toastStyle);
                }

                setTimeout(() => {
                    setSelectedWords([]);
                    setIsLoading(false);
                }, 1000);
            }
        };

        processCombination();
    }, [selectedWords]);

    return (
        <div className="bg-[#0F172A] text-white min-h-screen">
            <ModalPortal>
                <Toaster position="top-center" />
            </ModalPortal>
            <div className="bg-[#2A3284] text-center py-8 mb-8 px-4">
                <h1 className="text-2xl sm:text-3xl font-bold mb-4">Trò Chơi Ghép Từ AI</h1>
                <p className="text-base sm:text-lg max-w-3xl mx-auto">
                    Kết hợp các từ cơ bản để tạo từ mới với sự giúp đỡ của AI.
                </p>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-center mb-8">
                    <button
                        onClick={initializeGame}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg"
                        disabled={isLoading}
                    >
                        <FaSync className={isLoading ? 'animate-spin' : ''} />
                        Chơi lại
                    </button>
                </div>

                <div className="text-center mb-8">
                    <p className="text-xl font-bold">Điểm: {score}</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                    {words.map((word, index) => (
                        <motion.div
                            key={`word-${index}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => !isLoading && handleWordClick(word)}
                            className={`p-4 rounded-lg transition-all ${selectedWords.includes(word) ? 'bg-blue-600' :
                                word.isBase ? 'bg-purple-600 hover:bg-purple-700' :
                                    'bg-gray-800 hover:bg-gray-700'
                                } cursor-pointer`}
                        >
                            <div>
                                <div className="font-bold">{word.word}</div>
                                {!word.isBase && (
                                    <div className="text-sm text-gray-300">{word.combination}</div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
